define(['app/Cartesian', 'app/geometry'], function(Cartesian, geometry) {

    describe('cropToCircle()', function() {

        beforeEach(function() {
            jasmine.addCustomEqualityTester(Cartesian.equals);
        });

        it('handles empty list', function() {
            var cropped = geometry.cropToCircle([], 1.0);

            expect(cropped).toEqual([]);
        });

        it('returns empty list if polygon is outside circle', function() {
            var polygon = [
                new Cartesian(10,10,10),
                new Cartesian(11,10,10),
                new Cartesian(10,11,10)
            ];
            var cropped = geometry.cropToCircle(polygon, 1.0);

            expect(cropped).toEqual([]);
        });

        it('returns polygon untouched if it is inside circle', function() {
            var polygon = [
                new Cartesian(1,1,1),
                new Cartesian(2,1,1),
                new Cartesian(1,2,1)
            ];
            var cropped = geometry.cropToCircle(polygon, 10.0);

            expect(cropped).toEqual(polygon);
        });

        it('returns intersection of simple square and circle', function() {
            var polygon = [
                new Cartesian(0, 0, 0),
                new Cartesian(2, 0, 0),
                new Cartesian(2, 2, 0),
                new Cartesian(0, 2, 0)
            ];
            var cropped = geometry.cropToCircle(polygon, 1);

            // Check known points inside the circle
            expect(cropped[0]).toEqual(polygon[0]);
            expect(cropped[1]).toEqual(new Cartesian(1,0,0));
            expect(cropped[cropped.length-1]).toEqual(new Cartesian(0,1,0));

            // Simple check that there are more points in [cropped], in lieu of calculating points on circle
            expect(cropped.length).toBeGreaterThan(polygon.length);
        });

        it('adds all points already inside the circle with relative order preserved', function() {
            var polygon = [
                new Cartesian(0, 0, 0),
                new Cartesian(0.5, 0, 0),
                new Cartesian(2, 0, 0),
                new Cartesian(2, 2, 0),
                new Cartesian(0, 2, 0),
                new Cartesian(0, 0.5, 0)
            ];
            var cropped = geometry.cropToCircle(polygon, 1);

            // Check known points inside the circle
            expect(cropped[0]).toEqual(polygon[0]);
            expect(cropped[1]).toEqual(new Cartesian(0.5,0,0));
            expect(cropped[2]).toEqual(new Cartesian(1,0,0));
            expect(cropped[cropped.length-2]).toEqual(new Cartesian(0,1,0));
            expect(cropped[cropped.length-1]).toEqual(polygon[5]);

            // Simple check that there are more points in [cropped], in lieu of calculating points on circle
            expect(cropped.length).toBeGreaterThan(polygon.length);
        });

    });

});