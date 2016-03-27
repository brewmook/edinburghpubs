define(['views/View', 'adapters/SitesAdapter', 'adapters/VoronoiAdapter',
        'models/FilterModel', 'models/SitesModel', 'models/StatsModel',
        'intent/FilterIntent',
        'data/pubs'],
function(View, SitesAdapter, VoronoiAdapter,
         FilterModel, SitesModel, StatsModel,
         FilterIntent,
         pubsData) {

    function uniqueTags(sites)
    {
        var tags = {};
        sites.forEach(function(site) {
            var siteTags = site.properties.current.tags;
            siteTags.forEach(function(tag) {
                if (!tags.hasOwnProperty(tag)) {
                    tags[tag] = 0;
                }
            });
        });
        return Object.keys(tags).sort();
    }

    // ---------------------------------------------------------------------------------------------

    /**
     * Implements StatsModel.Stat to provide price information from a Site.
     * @constructor
     * @augments StatsModel.Stat
     */
    function Price() {}

    /** @inheritdoc */
    Price.prototype.label = function() { return "Price"; };

    /**
     * @param {Site} site
     * @returns {number}
     */
    Price.prototype.getValue = function(site) {
        if (site.properties.current && site.properties.current.visits.length > 0)
            return site.properties.current.visits[0].price;
        return 0;
    };

    /** @inheritdoc */
    Price.prototype.formatValue = function(value) {
        return "£"+value.toFixed(2);
    };

    /** @inheritdoc */
    Price.prototype.filterValidValues = function(values) {
        return values.filter(function(value) { return value > 0; });
    };

    // ---------------------------------------------------------------------------------------------

    /**
     * Implements StatsModel.Stat to provide price information from a Site.
     * @constructor
     * @augments StatsModel.Stat
     */
    function Age() {}

    /** @inheritdoc */
    Age.prototype.label = function() { return "Age"; };

    /**
     * @param {Site} site
     * @returns {number}
     */
    Age.prototype.getValue = function(site) {
        if (site.properties.current && site.properties.current.opened != '')
            return (new Date(Date.now())).getFullYear() - (new Date(site.properties.current.opened)).getFullYear();
        return -1;
    };

    /** @inheritdoc */
    Age.prototype.formatValue = function(value) {
        return value + " years";
    };

    /** @inheritdoc */
    Age.prototype.filterValidValues = function(values) {
        return values.filter(function(value) { return value >= 0; });
    };

    // ---------------------------------------------------------------------------------------------

    function initialiseMap()
    {
        var view = new View();
        view.setStatusMessage("Calculating...");

        var targetFeature = pubsData.features.shift();
        console.assert(
            targetFeature.properties.type === "Target",
            "Expected first feature to be the target area."
        );
        var target = {
            origin: targetFeature.geometry.coordinates,
            radius: targetFeature.properties.radius
        };

        view.target.setTarget(target.origin, target.radius);

        var sitesModel = new SitesModel(pubsData.features);
        var statsModel = new StatsModel();
        statsModel.setup(sitesModel);

        view.sites.setup(sitesModel);
        view.sites.addGroup("Visited (green)", "green", true);
        view.sites.addGroup("Todo (gold)", "gold", true);
        view.sites.addGroup("Excluded (red)", "red", false);

        var voronoiAdapter = new VoronoiAdapter(sitesModel, statsModel, view.voronoi, target);
        var sitesAdapter = new SitesAdapter(sitesModel, view.sites);

        // TODO: This is a little fragile. Must go before setVisibleGroups call.
        statsModel.stat.raise(new Price());

        sitesModel.setVisibleGroups(['Visited', 'Todo']);
        view.setStatusMessage("");

        var filterModel = new FilterModel();
        var filterIntent = new FilterIntent();
        filterModel.setup(filterIntent, sitesModel);
        view.filter.setup(filterModel);
        filterIntent.setup(view.filter);

        filterModel.allTags.raise(uniqueTags(pubsData.features));
    }

    initialiseMap();
});
