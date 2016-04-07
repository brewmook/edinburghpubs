define(['utility/Colour', 'utility/ColourMap', 'utility/Observable'],
function (Colour, ColourMap, Observable) {

    // ---------------------------------------------------------------------------------------------
    // Private functions
    // ---------------------------------------------------------------------------------------------

    function compareNumbers(a, b)
    {
        return a - b;
    }

    // ---------------------------------------------------------------------------------------------
    // StatsModel
    // ---------------------------------------------------------------------------------------------

    /**
     * @constructor
     */
    function StatsModel()
    {
        /** @type {Observable.<ColourMap>} */
        this.colourMap = new Observable();
        /** @type {Observable.<StatsModel.Stat>} */
        this.stat = new Observable();
        /** @type {Observable.<StatsModel.Summary>} */
        this.summary = new Observable();
        /**
         * @type {?StatsModel.Stat}
         * @private
         */
        this._cachedStat = null;

        this.stat.subscribe(function(stat) {
            this._cachedStat = stat;
        }, this);
    }

    /**
     * @param {SitesModel} sitesModel
     */
    StatsModel.prototype.setup = function(sitesModel)
    {
        sitesModel.visibleSites.subscribe(function(sites) {
            var stat = this._cachedStat;
            if (stat && sites.length > 0) {
                var values = stat.filterValidValues(sites.map(stat.getValue)).sort(compareNumbers);
                var summary = null;
                if (values.length > 0) {
                    summary = new StatsModel.Summary(
                        values[0],
                        values[values.length-1],
                        values[Math.floor(values.length/2)]
                    );
                }
                this.summary.raise(summary);

                var colourMap = new ColourMap();
                colourMap.setOutOfRangeColour(new Colour(64,64,64));
                if (summary) {
                    colourMap.addColour(summary.minimum, new Colour(0,255,0));
                    colourMap.addColour(summary.median, new Colour(0,0,255));
                    colourMap.addColour(summary.maximum, new Colour(255,0,0));
                }
                this.colourMap.raise(colourMap);
            }
        }, this);
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
     * A label for display purposes.
     * @returns {string}
     */
    StatsModel.Stat.prototype.label = function() {};
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
    // StatsModel.Summary
    // ---------------------------------------------------------------------------------------------

    /**
     * @param minimum
     * @param maximum
     * @param median
     * @constructor
     */
    StatsModel.Summary = function(minimum, maximum, median)
    {
        this.minimum = minimum;
        this.maximum = maximum;
        this.median = median;
    };

    // ---------------------------------------------------------------------------------------------

    return StatsModel;

});
