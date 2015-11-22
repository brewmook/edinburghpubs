define([], function() {

    /**
     * A point in cartesian space.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @constructor
     */
    function Cartesian(x, y, z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    Cartesian.prototype.toString = function() {
        return 'Cartesian{' + this.x + ', ' + this.y + ', ' + this.z + '}';
    };

    /**
     * @param {Cartesian} a
     * @param {Cartesian} b
     * @returns {boolean|undefined}
     */
    Cartesian.equals = function(a, b) {
        if (a instanceof Cartesian && b instanceof Cartesian) {
            return a.x == b.x && a.y == b.y && a.z == b.z;
        }
        return undefined;
    };

    /**
     * @param {Cartesian} a
     * @param {Cartesian} b
     * @param {number} epsilon
     * @returns {boolean|undefined}
     */
    Cartesian.almostEquals = function(a, b, epsilon) {
        if (a instanceof Cartesian && b instanceof Cartesian) {
            return Math.abs(a.x - b.x) < epsilon
                && Math.abs(a.y - b.y) < epsilon
                && Math.abs(a.z - b.z) < epsilon;
        }
        return undefined;
    };

    return Cartesian;

});
