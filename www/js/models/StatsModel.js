define(['app/ObservableValue'],
function (ObservableValue) {

    // ---------------------------------------------------------------------------------------------
    // Private functions
    // ---------------------------------------------------------------------------------------------

    function compareNumbers(a, b)
    {
        return a - b;
    }

    function Stats(minimum, maximum, median)
    {
        this.minimum = minimum;
        this.maximum = maximum;
        this.median = median;
    }

    // ---------------------------------------------------------------------------------------------
    // StatsModel
    // ---------------------------------------------------------------------------------------------

    /**
     * @constructor
     */
    function StatsModel(stat, objects)
    {
        /** @type {ObservableValue.<StatsModel.Stat>} */
        this.stat = new ObservableValue(stat);
        /** @type {ObservableValue.<Stats>} */
        this.stats = new ObservableValue(undefined);

        this.collectStats(objects);
    }

    /**
     * @param {Object[]} objects
     */
    StatsModel.prototype.collectStats = function(objects)
    {
        if (objects.length > 0) {
            var stat = this.stat.get();
            var values = stat.filterValidValues(objects.map(stat.getValue)).sort(compareNumbers);
            var stats = null;
            if (values.length > 0) {
                stats = new Stats(
                    values[0],
                    values[values.length-1],
                    values[Math.floor(values.length/2)]
                );
            }
            this.stats.set(stats);
        }
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

    return StatsModel;

});
