define(['app/Cartesian', 'app/GeoCoord', 'app/geometry'], function(Cartesian, GeoCoord, geometry) {

    describe('cropToCircle()', function() {

        beforeEach(function() {
            jasmine.addCustomEqualityTester(Cartesian.equals);
        });

        it('handles empty list', function() {
            var cropped = geometry.cropToCircle([], 1, 45);

            expect(cropped).toEqual([]);
        });

        it('returns empty list if polygon is outside circle', function() {
            var polygon = [
                new Cartesian(10,10,10),
                new Cartesian(11,10,10),
                new Cartesian(10,11,10)
            ];
            var cropped = geometry.cropToCircle(polygon, 1, 45);

            expect(cropped).toEqual([]);
        });

        it('returns polygon untouched if it is inside circle', function() {
            var polygon = [
                new Cartesian(1,1,1),
                new Cartesian(2,1,1),
                new Cartesian(1,2,1)
            ];
            var cropped = geometry.cropToCircle(polygon, 10, 45);

            expect(cropped).toEqual(polygon);
        });

        it('returns intersection of simple square and circle', function() {
            var polygon = [
                new Cartesian(0, 0, 0),
                new Cartesian(0, 2, 0),
                new Cartesian(2, 2, 0),
                new Cartesian(2, 0, 0)
            ];
            var cropped = geometry.cropToCircle(polygon, 1, 10);

            // Check known points inside the circle
            expect(cropped[0]).toEqual(polygon[0]);
            expect(cropped[1]).toEqual(new Cartesian(0,1,0));
            expect(cropped[cropped.length-1]).toEqual(new Cartesian(1,0,0));

            // Simple check for expected number of points, in lieu of calculating exact points
            expect(cropped.length).toEqual(11);
        });

        it('adds all points already inside the circle with relative order preserved', function() {
            var polygon = [
                new Cartesian(0, 0, 0),
                new Cartesian(0, 0.5, 0),
                new Cartesian(0, 2, 0),
                new Cartesian(2, 2, 0),
                new Cartesian(2, 0, 0),
                new Cartesian(0.5, 0, 0),
            ];
            var cropped = geometry.cropToCircle(polygon, 1, 10);

            // Check known points inside the circle
            expect(cropped[0]).toEqual(polygon[0]);
            expect(cropped[1]).toEqual(new Cartesian(0,0.5,0));
            expect(cropped[2]).toEqual(new Cartesian(0,1,0));
            expect(cropped[cropped.length-2]).toEqual(new Cartesian(1,0,0));
            expect(cropped[cropped.length-1]).toEqual(polygon[5]);

            // Simple check for expected number of points, in lieu of calculating exact points
            expect(cropped.length).toEqual(13);
        });

        it('handles square intersection even though no points are inside circle', function() {
            var polygon = [
                new Cartesian(-2, 0, 0),
                new Cartesian(-2, 2, 0),
                new Cartesian( 2, 2, 0),
                new Cartesian( 2, 0, 0)
            ];
            var cropped = geometry.cropToCircle(polygon, 1, 45);

            // Simple check for expected number of points, in lieu of calculating exact points
            expect(cropped.length).toEqual(5);

            // Check known points inside the circle
            expect(cropped[0]).toEqual(new Cartesian(1,0,0));
            expect(cropped[1]).toEqual(new Cartesian(-1,0,0));
        });

        it('handles rectangle with edges tangential to circle', function() {
            var polygon = [
                new Cartesian(-1, 0, 0),
                new Cartesian(-1, 2, 0),
                new Cartesian(1, 2, 0),
                new Cartesian(1, 0, 0)
            ];
            var cropped = geometry.cropToCircle(polygon, 1, 45);

            // Simple check for expected number of points, in lieu of calculating exact points
            expect(cropped.length).toEqual(5);

            // Check known points inside the circle
            expect(cropped[0]).toEqual(new Cartesian(1,0,0));
            expect(cropped[1]).toEqual(new Cartesian(-1,0,0));
        });

    });

    describe('lineCircleIntersections', function() {

        it('returns intersections sorted by proximity to point1', function() {
            var intersections = geometry.lineCircleIntersections(
                new Cartesian(-2, 0, 0),
                new Cartesian(2, 0, 0),
                1.0
            );
            expect(intersections.length).toEqual(2);
            expect(intersections[0]).toEqual(0.25);
            expect(intersections[1]).toEqual(0.75);
        });

    });

    describe('calculateCartesians', function() {

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
                //console.log('actual: ' + cartesian.toString());
                //console.log('expected: ' + expected[i]);
                expect(Cartesian.almostEquals(cartesian, expected[i], 1)).toBeTruthy();
            }
        });

    });

    describe('cartesianToGeoCoord', function() {

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
                console.log('actual: ' + actual[i]);
                console.log('expected: ' + expected[i]);
                expect(GeoCoord.almostEquals(actual[i], expected[i], 1)).toBeTruthy();
            }
        });

    });
});