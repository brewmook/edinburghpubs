define(['app/Colour'],
function (Colour) {

    // -----------------------------------------------------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @constructor
     */
    function ColourMap()
    {
        /** @type {{value:number, colour:Colour}[]} */
        this._colours = [];
        /** @type {!Colour} */
        this._outOfRangeColour = null;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @param {{value:number, colour:Colour}[]} colours
     * @param {number} value
     * @returns {number} The index into [this._colours].
     * @private
     */
    function upperBound(colours, value)
    {
        var i = 0;
        while (i < colours.length && colours[i].value <= value) {
            ++i;
        }
        return i;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Member functions
    // -----------------------------------------------------------------------------------------------------------------

    ColourMap.prototype.clear = function()
    {
        this._colours = [];
    };

    /**
     * @param {number} value
     * @param {Colour} colour
     */
    ColourMap.prototype.addColour = function(value, colour)
    {
        var exists = this._colours.some(function(x) { return x.value == value; });
        if (!exists) {
            var i = upperBound(this._colours, value);
            this._colours.splice(i, 0, {value: value, colour: colour});
        }
    };

    /**
     * @param {?Colour} colour
     */
    ColourMap.prototype.setOutOfRangeColour = function(colour)
    {
        this._outOfRangeColour = colour;
    };

    /**
     * @param {number} value
     * @returns {Colour}
     */
    ColourMap.prototype.colour = function(value)
    {
        var i = upperBound(this._colours, value);

        if (i == 0) {
            return this._outOfRangeColour || this._colours[0].value;
        }
        else if (i == this._colours.length) {
            if (this._colours[i-1].value == value) {
                return this._colours[i-1].colour;
            }
            else {
                return this._outOfRangeColour || this._colours[i-1].colour;
            }
        }

        var low = this._colours[i-1];
        var high = this._colours[i];
        return Colour.interpolate(
            (value - low.value) / (high.value - low.value),
            low.colour,
            high.colour
        );
    };

    return ColourMap;

});
