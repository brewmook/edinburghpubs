define(['app/Colour', 'app/ColourMap'],
function (Colour, ColourMap) {

    /**
     * @param {number} price
     * @returns {string}
     */
    function formatPrice(price) {
        return "£"+price.toFixed(2);
    }

    /**
     * @param {Site[]} sites
     * @returns {Visit[]}
     */
    function mostRecentVisits(sites)
    {
        return sites.filter(function(site) { return site.history.length>0 && site.history[0].visits.length>0; })
            .map(function(site) {return site.history[0].visits[0]; });
    }

    /**
     * @param {Object[]} objects
     * @param {string} key
     * @returns {Array}
     */
    function getPropertyValues(objects, key)
    {
        return objects.filter(function(object) { return object.hasOwnProperty(key); })
            .map(function(object) { return object[key]; });
    }

    /**
     * Extract minimum, maximum and median values within a list of sites.
     *
     * @param {Array} values - Array of *sorted* values.
     * @returns {{min:*, max:*, med:*}}
     */
    function minMaxMedian(values)
    {
        return {
            min: values[0],
            max: values[values.length-1],
            med: values[Math.floor(values.length/2)]
        };
    }

    /**
     * Extract minimum, maximum and median values within a list of sites.
     *
     * @param {Site[]} sites
     * @param {string} key
     * @returns {{min:*, max:*, med:*}}
     */
    function gatherStatistics(sites, key)
    {
        var values = getPropertyValues(mostRecentVisits(sites), key)
            .filter(function(value) { return value > 0; })
            .sort();

        return minMaxMedian(values);
    }

    function price(site) {
        if (site.history.length > 0 && site.history[0].visits.length > 0)
            return site.history[0].visits[0].price;
        return 0;
    }

    function StatsModel()
    {
        this._colourMap = new ColourMap();
        this._colourMap.setOutOfRangeColour(new Colour(64,64,64));
        this.colourKeyStrings = [];
    }

    StatsModel.prototype.setDetails = function(sites)
    {
        var stats = gatherStatistics(sites, 'price');

        this._colourMap.addColour(stats.min, new Colour(0,255,0));
        this._colourMap.addColour(stats.med, new Colour(0,0,255));
        this._colourMap.addColour(stats.max, new Colour(255,0,0));

        this.colourKeyStrings = [
            "Low (green): " + formatPrice(stats.min),
            "Median (blue): " + formatPrice(stats.med),
            "High (red): " + formatPrice(stats.max),
            "No data (grey)"
        ];
    };

    StatsModel.prototype.getColour = function(site)
    {
        return this._colourMap.colour(price(site));
    };

    return StatsModel;
});
