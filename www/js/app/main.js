define(['app/Grouper',
        'views/View', 'adapters/SitesAdapter', 'adapters/TagsAdapter', 'adapters/VoronoiAdapter',
        'models/SitesModel', 'models/StatsModel', 'data/pubs'],
function(Grouper,
         View, SitesAdapter, TagsAdapter, VoronoiAdapter,
         SitesModel, StatsModel, pubsData) {

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
        var excludedTags = ['Disqualified', 'Closed'];
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
        if (site.history.length > 0 && site.history[0].visits.length > 0)
            return site.history[0].visits[0].price;
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
        if (site.history.length > 0 && site.history[0].opened != '')
            return (new Date(Date.now())).getFullYear() - (new Date(site.history[0].opened)).getFullYear();
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
        view.target.setTarget(pubsData.target.origin, pubsData.target.radius);
        view.tags.setTags(uniqueTags(pubsData.sites));

        view.sites.addGroup("Visited (green)", "green", true);
        view.sites.addGroup("Todo (gold)", "gold", true);
        view.sites.addGroup("Excluded (red)", "red", false);

        var grouper = new Grouper();
        grouper.addGroup("Visited", isBlogged);
        grouper.addGroup("Todo", function(site) { return !isBlogged(site) && !isExcluded(site); });
        grouper.addGroup("Excluded", function(site) { return !isBlogged(site) && isExcluded(site); });

        var sitesModel = new SitesModel(pubsData.sites, grouper);
        var statsModel = new StatsModel(new Price(), pubsData.sites);

        var voronoiAdapter = new VoronoiAdapter(sitesModel, statsModel, view.voronoi, pubsData.target);
        var sitesAdapter = new SitesAdapter(sitesModel, view.sites, grouper);
        var tagsAdapter = new TagsAdapter(sitesModel, view.tags);

        sitesModel.sites.subscribe(function(sites) {
            statsModel.collectStats(sites);
        });

        sitesModel.setVisibleGroups(['Visited', 'Todo']);
        view.setStatusMessage("");
    }

    initialiseMap();
});
