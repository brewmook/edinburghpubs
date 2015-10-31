define(['app/Colour', 'app/ColourMap', 'app/Grouper',
        'views/View', 'adapters/SitesAdapter', 'adapters/TagsAdapter', 'adapters/VoronoiAdapter',
        'models/SitesModel', 'data/pubs'],
function (Colour, ColourMap, Grouper,
          View, SitesAdapter, TagsAdapter, VoronoiAdapter,
          SitesModel, pubsData) {

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

    /**
     * @param {string[]} tags1
     * @param {string[]} tags2
     * @returns {boolean}
     */
    function tagsIntersect(tags1, tags2)
    {
        return tags1.some(function(tag1) {
            return tags2.some(function(tag2) {
                return tag1 == tag2;
            });
        });
    }

    function isBlogged(site) {
        return site.history.length
            && site.history[0].visits.length
            && site.history[0].visits[0].link;
    }

    function isExcluded(site) {
        var excludedTags = ['Disqualified', 'Closed', 'Student Union', 'Club', 'Restaurant'];
        return tagsIntersect(site.history[0].tags, excludedTags);
    }

    function uniqueTags(sites)
    {
        var tags = {};
        sites.forEach(function(site) {
            var siteTags = site.history[0].tags;
            siteTags.forEach(function(tag) {
                if (!tags.hasOwnProperty(tag)) {
                    tags[tag] = 0;
                }
            });
        });
        return Object.keys(tags).sort();
    }

    function price(site) {
        if (site.history.length > 0 && site.history[0].visits.length > 0)
            return site.history[0].visits[0].price;
        return 0;
    }

    function initialiseMap()
    {
        var view = new View();
        view.setStatusMessage("Calculating...");
        view.target.setTarget(pubsData.target.origin, pubsData.target.radius);
        view.tags.setTags(uniqueTags(pubsData.sites));

        var stats = gatherStatistics(pubsData.sites, 'price');
        var colourMap = new ColourMap();
        colourMap.setOutOfRangeColour(new Colour(64,64,64));
        colourMap.addColour(stats.min, new Colour(0,255,0));
        colourMap.addColour(stats.med, new Colour(0,0,255));
        colourMap.addColour(stats.max, new Colour(255,0,0));

        view.sites.addGroup("Visited (green)", "green", true);
        view.sites.addGroup("Todo (gold)", "gold", true);
        view.sites.addGroup("Excluded (red)", "red", false);

        var grouper = new Grouper();
        grouper.addGroup("Visited", isBlogged);
        grouper.addGroup("Todo", function(site) { return !isBlogged(site) && !isExcluded(site); });
        grouper.addGroup("Excluded", function(site) { return !isBlogged(site) && isExcluded(site); });

        var sitesModel = new SitesModel(pubsData.sites, grouper);

        var voronoiAdapter = new VoronoiAdapter(sitesModel, view.voronoi, pubsData.target);
        voronoiAdapter.colourCallback = function(site) { return colourMap.colour(price(site)); };
        var sitesAdapter = new SitesAdapter(sitesModel, view.sites, grouper);
        var tagsAdapter = new TagsAdapter(sitesModel, view.tags);

        sitesModel.setTag('');
        sitesModel.setVisibleGroups(['Visited', 'Todo']);

        // Just use status message area for now to display the voronoi legend.
        var colourKeyStrings = [
            "Low (green): " + formatPrice(stats.min),
            "Median (blue): " + formatPrice(stats.med),
            "High (red): " + formatPrice(stats.max)
        ];
        view.setStatusMessage("Prices:<br/>" + colourKeyStrings.join("<br/>"));
    }

    initialiseMap();
});
