define(function() {

    // -----------------------------------------------------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @param {number} r - Red component in range 0 to 255.
     * @param {number} g - Green component in range 0 to 255.
     * @param {number} b - Blue component in range 0 to 255.
     * @constructor
     */
    function Colour(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------

    function interpolate(t, a, b) {
        return a + t * (b - a);
    }

    function round(value)
    {
        return Math.floor(value + 0.5);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Member functions
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Convert to HTML #RRGGBB format.
     *
     * @returns {string}
     */
    Colour.prototype.toString = function()
    {
        var intColour = (round(this.r) << 16) + (round(this.g) << 8) + round(this.b);
        return '#' + ('000000' + intColour.toString(16)).slice(-6);
    };

    // -----------------------------------------------------------------------------------------------------------------
    // Static functions
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Interpolate between two colours.
     *
     * @param {number} t - Interpolation value in range 0 to 1.
     * @param {Colour} low - Colour for t = 0.
     * @param {Colour} high - Colour for t = 1.
     */
    Colour.interpolate = function(t, low, high) {
        return new Colour(
            interpolate(t, low.r, high.r),
            interpolate(t, low.g, high.g),
            interpolate(t, low.b, high.b)
        );
    };

    return Colour;

});