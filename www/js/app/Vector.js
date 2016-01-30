define([], function() {

    // Private

    function interpolate(n1, n2, t) {
        return n1 + (n2-n1)*t;
    }

    // Vector

    var Vector = {};

    /**
     * @param {*[]} a
     * @param {*[]} b
     * @returns {boolean}
     */
    Vector.equals = function(a, b) {
        if (a.length == b.length) {
            for (var i = 0; i < a.length; ++i) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };

    /**
     * @param {number[]} a
     * @param {number[]} b
     * @param {number} epsilon
     * @returns {boolean|undefined}
     */
    Vector.almostEquals = function(a, b, epsilon) {
        if (a instanceof Array && b instanceof Array) {
            if (a.length == b.length) {
                for (var i = 0; i < a.length; ++i) {
                    if (Math.abs(a[i] - b[i]) >= epsilon) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        return undefined;
    };

    /**
     * @param {number[]} vector1
     * @param {number[]} vector2
     * @param {number} t
     * @return {number[]}
     */
    Vector.interpolate = function(vector1, vector2, t) {
        return vector1.map(function(v, i) {
            return interpolate(v, vector2[i], t);
        });
    };

    return Vector;

});
