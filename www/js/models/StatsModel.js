define(['app/Colour', 'app/ColourMap', 'app/ObservableValue'],
function (Colour, ColourMap, ObservableValue) {

    // ---------------------------------------------------------------------------------------------
    // Private functions
    // ---------------------------------------------------------------------------------------------

    function compareNumbers(a, b)
    {
        return a - b;
    }

    function minMaxMedian(values)
    {
        return {
            min: values[0],
            max: values[values.length-1],
            med: values[Math.floor(values.length/2)]
        };
    }

    // ---------------------------------------------------------------------------------------------
    // StatsModel
    // ---------------------------------------------------------------------------------------------

    /**
     * @constructor
     */
    function StatsModel()
    {
        this._colourMap = new ColourMap();
        this._colourMap.setOutOfRangeColour(new Colour(64,64,64));
        /** @type {string[]} */
        this._colourKeyStrings = [];
        /** @type {ObservableValue.<StatsModel.Stat>} */
        this.stat = new ObservableValue(undefined);
    }

    /**
     * @param {StatsModel.Stat} stat
     * @param {Object[]} objects
     */
    StatsModel.prototype.setStat = function(stat, objects)
    {
        var stats =  minMaxMedian(stat.filterValidValues(objects.map(stat.getValue)).sort(compareNumbers));

        this._colourMap.clear();
        this._colourMap.addColour(stats.min, new Colour(0,255,0));
        this._colourMap.addColour(stats.med, new Colour(0,0,255));
        this._colourMap.addColour(stats.max, new Colour(255,0,0));

        this._colourKeyStrings = [
            "Low (green): " + stat.formatValue(stats.min),
            "Median (blue): " + stat.formatValue(stats.med),
            "High (red): " + stat.formatValue(stats.max),
            "No data (grey)"
        ];

        this.stat.set(stat);
    };

    /**
     * @param {Object} object
     * @returns {Colour}
     */
    StatsModel.prototype.getColour = function(object)
    {
        if (this.stat.get() !== undefined) {
            return this._colourMap.colour(this.stat.get().getValue(object));
        }
        return new Colour(64,64,64);
    };

    /**
     * @returns {string[]}
     */
    StatsModel.prototype.getColourKeyStrings = function()
    {
        return this._colourKeyStrings;
    };

    // ---------------------------------------------------------------------------------------------
    // StatsModel.Stat
    // ---------------------------------------------------------------------------------------------

    /**
     * Abstract class representing a statistic.
     * @constructor
     */
    StatsModel.Stat = function() {};
    /**
     * Extracts the value from the object.
     * @param {Object} object
     * @returns {number}
     */
    StatsModel.Stat.prototype.getValue = function(object) {};
    /**
     * Formats a previously extracted value for presentation.
     * @param {number} value
     * @returns {string}
     */
    StatsModel.Stat.prototype.formatValue = function(value) {};
    /**
     * Filters a list of values down to only valid values.
     * @param {number[]} values
     * @returns {number[]}
     */
    StatsModel.Stat.prototype.filterValidValues = function(values) {};

    // ---------------------------------------------------------------------------------------------

    return StatsModel;

});
