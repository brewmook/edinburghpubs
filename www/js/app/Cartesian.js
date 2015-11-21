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

    return Cartesian;

});
