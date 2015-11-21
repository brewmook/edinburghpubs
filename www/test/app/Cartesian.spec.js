define(['app/Cartesian'], function(Cartesian) {

    describe('Cartesian.equals()', function() {

        it('returns true if two Cartesians are equal', function() {
            var alpha = new Cartesian(1,2,3);
            var beta = new Cartesian(alpha.x, alpha.y, alpha.z);
            expect(Cartesian.equals(alpha, beta)).toEqual(true);

            alpha = new Cartesian(4,5,6);
            beta = new Cartesian(alpha.x, alpha.y, alpha.z);
            expect(Cartesian.equals(alpha, beta)).toEqual(true);
        });

        it('returns false if two Cartesians are not equal', function() {
            var alpha = new Cartesian(1,2,3);

            var beta = new Cartesian(alpha.x+1, alpha.y, alpha.z);
            expect(Cartesian.equals(alpha, beta)).toEqual(false);

            beta = new Cartesian(alpha.x, alpha.y+1, alpha.z);
            expect(Cartesian.equals(alpha, beta)).toEqual(false);

            beta = new Cartesian(alpha.x, alpha.y, alpha.z+1);
            expect(Cartesian.equals(alpha, beta)).toEqual(false);
        });

        it('returns undefined if either argument is not Cartesian', function() {
            var cartesian = new Cartesian(1,2,3);
            expect(Cartesian.equals(cartesian,'blah')).toBeUndefined();
            expect(Cartesian.equals('blah',cartesian)).toBeUndefined();
            expect(Cartesian.equals(123, 456)).toBeUndefined();
        });

    });

});