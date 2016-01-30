define(['app/Cartesian', 'app/GeoCoord', 'app/Vector', 'app/geometry'],
function(Cartesian, GeoCoord, Vector, geometry) {

    var customMatchers = {
        toBeAlmostEqual: function(util, customEqualityTesters) {
            return {
                compare: function(actual, expected, epsilon) {
                    if (actual instanceof Array && expected instanceof Array) {
                        return {
                            pass: Vector.almostEquals(actual, expected, epsilon)
                        }
                    }
                    return {
                        pass: actual.almostEquals(expected, epsilon)
                    };
                }
            }
        }
    };

    describe('cropToCircle2d()', function() {

        beforeEach(function() {
            jasmine.addCustomEqualityTester(Cartesian.equals);
            jasmine.addMatchers(customMatchers);
        });

        it('handles empty list', function() {
            var cropped = geometry.cropToCircle2d([], 1, 45);

            expect(cropped).toEqual([]);
        });

        it('returns empty list if polygon is outside circle', function() {
            var polygon = [
                [ 0,10],
                [10,11],
                [11,10]
            ];
            var cropped = geometry.cropToCircle2d(polygon, 1, 45);

            expect(cropped).toEqual([]);
        });

        it('returns polygon untouched if it is inside circle', function() {
            var polygon = [
                [1,1],
                [2,1],
                [1,2]
            ];
            var cropped = geometry.cropToCircle2d(polygon, 10, 45);

            expect(cropped).toEqual(polygon);
        });

        it('returns intersection of simple square and circle', function() {
            var polygon = [
                [0, 0],
                [0, 2],
                [2, 2],
                [2, 0]
            ];
            var cropped = geometry.cropToCircle2d(polygon, 1, 10);

            // Check known points inside the circle
            expect(cropped[0]).toEqual(polygon[0]);
            expect(cropped[1]).toEqual([0,1]);
            expect(cropped[cropped.length-1]).toEqual([1,0]);

            // Simple check for expected number of points, in lieu of calculating exact points
            expect(cropped.length).toEqual(11);
        });

        it('returns intersection of simple square and circle where only first point is outside', function() {
            var polygon = [
                [0.9, 0.9],
                [0.9, 0],
                [0, 0],
                [0, 0.9]
            ];
            var cropped = geometry.cropToCircle2d(polygon, 1, 90);

            // Check known points inside the circle
            expect(cropped[0]).toEqual(polygon[1]);
            expect(cropped[1]).toEqual(polygon[2]);
            expect(cropped[2]).toEqual(polygon[3]);

            // Simple check for expected number of points, in lieu of calculating exact points
            expect(cropped.length).toEqual(5);
        });

        it('adds all points already inside the circle with relative order preserved', function() {
            var polygon = [
                [0, 0],
                [0, 0.5],
                [0, 2],
                [2, 2],
                [2, 0],
                [0.5, 0]
            ];
            var cropped = geometry.cropToCircle2d(polygon, 1, 10);

            // Check known points inside the circle
            expect(cropped[0]).toEqual(polygon[0]);
            expect(cropped[1]).toEqual([0,0.5]);
            expect(cropped[2]).toEqual([0,1]);
            expect(cropped[cropped.length-2]).toEqual([1,0]);
            expect(cropped[cropped.length-1]).toEqual(polygon[5]);

            // Simple check for expected number of points, in lieu of calculating exact points
            expect(cropped.length).toEqual(13);
        });

        it('handles square intersection even though no points are inside circle', function() {
            var polygon = [
                [-2, 0],
                [-2, 2],
                [ 2, 2],
                [ 2, 0]
            ];
            var cropped = geometry.cropToCircle2d(polygon, 1, 45);

            // Simple check for expected number of points, in lieu of calculating exact points
            expect(cropped.length).toEqual(5);

            // Check known points inside the circle
            expect(cropped[0]).toEqual([1,0]);
            expect(cropped[1]).toEqual([-1,0]);
        });

        it('handles rectangle with edges tangential to circle', function() {
            var polygon = [
                [-1, 0],
                [-1, 2],
                [1, 2],
                [1, 0]
            ];
            var cropped = geometry.cropToCircle2d(polygon, 1, 45);

            // Simple check for expected number of points, in lieu of calculating exact points
            expect(cropped.length).toEqual(5);

            // Check known points inside the circle
            expect(cropped[0]).toEqual([-1,0]);
            expect(cropped[cropped.length-1]).toEqual([1,0]);
        });

        it('handles XXX rectangle with two opposite edges intersecting circle', function() {
            var sinPiBy4 = Math.sin(Math.PI/4);
            var polygon = [
                [-2, 0],
                [-2, 1],
                [2, 1],
                [2, 0]
            ];
            var expected = [
                [1, 0],
                [-1, 0],
                [-sinPiBy4, sinPiBy4],
                [0, 1],
                [sinPiBy4, sinPiBy4]
            ];

            var cropped = geometry.cropToCircle2d(polygon, 1, 45);

            expect(cropped.length).toEqual(expected.length);
            for (var i = 0; i < cropped.length; ++i) {
                expect(cropped[i]).toBeAlmostEqual(expected[i], 0.01);
            }
        });

        it('handles rectangle with two opposite edges intersecting circle', function() {
            var sinPiBy4 = Math.sin(Math.PI/4);
            var polygon = [
                [-2, sinPiBy4],
                [ 2, sinPiBy4],
                [ 2,-sinPiBy4],
                [-2,-sinPiBy4]
            ];
            var expected = [
                [-sinPiBy4, sinPiBy4],
                [sinPiBy4, sinPiBy4],
                [1, 0],
                [sinPiBy4, -sinPiBy4],
                [-sinPiBy4, -sinPiBy4],
                [-1, 0]
            ];

            var cropped = geometry.cropToCircle2d(polygon, 1, 45);

            expect(cropped.length).toEqual(expected.length);
            for (var i = 0; i < cropped.length; ++i) {
                expect(cropped[i]).toBeAlmostEqual(expected[i], 0.01);
            }
        });

    });

    describe('lineCircleIntersections2d', function() {

        it('returns intersections sorted by proximity to point1', function() {
            var intersections = geometry.lineCircleIntersections2d(
                [-2, 0],
                [2, 0],
                1.0
            );
            expect(intersections.length).toEqual(2);
            expect(intersections[0]).toEqual(0.25);
            expect(intersections[1]).toEqual(0.75);
        });

    });

    describe('calculateCartesians', function() {

        beforeEach(function() {
            jasmine.addMatchers(customMatchers);
        });

        it('converts lat/lng to cartesian coordinates', function() {
            var origin = new GeoCoord(1,1);
            var sphereRadius = 1000;
            var geocoords = [
                new GeoCoord(1,1),
                new GeoCoord(0,1),
                new GeoCoord(2,1),
                new GeoCoord(1,0),
                new GeoCoord(1,2)
            ];
            var expected = [
                new Cartesian(0.0, 0.0, sphereRadius),
                new Cartesian(0, -17, sphereRadius),
                new Cartesian(0,  17, sphereRadius),
                new Cartesian(-17, 0, sphereRadius),
                new Cartesian( 17, 0, sphereRadius)
            ];

            var actual = geometry.calculateCartesians(geocoords, origin, sphereRadius);
            expect(actual.length).toEqual(expected.length);

            for (var i = 0; i < actual.length; ++i) {
                var cartesian = new Cartesian(actual[i].x, actual[i].y, actual[i].z);
                expect(cartesian).toBeAlmostEqual(expected[i], 1);
            }
        });

    });

    describe('cartesianToGeoCoord', function() {

        beforeEach(function() {
            jasmine.addMatchers(customMatchers);
        });

        it('converts cartesians to lat/lng', function() {
            var origin = new GeoCoord(1,1);
            var sphereRadius = 1000;
            var cartesians = [
                new Cartesian(0.0, 0.0, sphereRadius),
                new Cartesian(0, -17, sphereRadius),
                new Cartesian(0,  17, sphereRadius),
                new Cartesian(-17, 0, sphereRadius),
                new Cartesian( 17, 0, sphereRadius)
            ];
            var expected = [
                new GeoCoord(1,1),
                new GeoCoord(0,1),
                new GeoCoord(2,1),
                new GeoCoord(1,0),
                new GeoCoord(1,2)
            ];

            var actual = geometry.cartesianToGeoCoord(cartesians, origin, sphereRadius);
            expect(actual.length).toEqual(expected.length);

            for (var i = 0; i < actual.length; ++i) {
                expect(actual[i]).toBeAlmostEqual(expected[i], 1);
            }
        });

    });

    describe('clockwiseArc2d', function() {

        var tolerance = 0.001;

        beforeEach(function() {
            jasmine.addMatchers(customMatchers);
        });

        it('plots points between given two points at opposite extremes on x axis', function() {
            var sinPiBy4 = Math.sin(Math.PI/4);
            var polygon = geometry.clockwiseArc2d([1,0], [-1,0], 1, 45);

            expect(polygon.length).toBe(3);
            expect(polygon[0]).toBeAlmostEqual([sinPiBy4,-sinPiBy4], tolerance);
            expect(polygon[1]).toBeAlmostEqual([0,-1], tolerance);
            expect(polygon[2]).toBeAlmostEqual([-sinPiBy4,-sinPiBy4], tolerance);
        });

        it('plots full circle given the same two points, but doesn\'t include th point itself', function() {
            var polygon = geometry.clockwiseArc2d([1,0], [1,0], 1, 90);

            expect(polygon.length).toBe(3);
            expect(polygon[0]).toBeAlmostEqual([0,-1], tolerance);
            expect(polygon[1]).toBeAlmostEqual([-1,0], tolerance);
            expect(polygon[2]).toBeAlmostEqual([0,1], tolerance);
        });

    });
});