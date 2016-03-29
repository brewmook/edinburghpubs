define(['views/View', 'adapters/VoronoiAdapter',
        'models/FilterModel', 'models/GroupsModel', 'models/SitesModel', 'models/StatsModel',
        'intent/FilterIntent', 'intent/GroupsIntent',
        'data/pubs'],
function(View, VoronoiAdapter,
         FilterModel, GroupsModel, SitesModel, StatsModel,
         FilterIntent, GroupsIntent,
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

    function setupMVI(model, view, intent)
    {
        model.setup(intent);
        intent.setup(view);
        view.setup(model);
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

        var filterModel = new FilterModel();
        var filterIntent = new FilterIntent();
        setupMVI(filterModel, view.filter, filterIntent);

        var groupsModel = new GroupsModel();
        var groupsIntent = new GroupsIntent();
        setupMVI(groupsModel, view.groups, groupsIntent);

        var sitesModel = new SitesModel();
        sitesModel.setup(filterModel, groupsModel);
        view.sites.setup(sitesModel, groupsModel);

        var statsModel = new StatsModel();
        statsModel.setup(sitesModel);

        var voronoiAdapter = new VoronoiAdapter(sitesModel, statsModel, view.voronoi, target);

        statsModel.stat.raise(new Price());

        view.setStatusMessage("");

        groupsModel.setGroups([
            new GroupsModel.Group("Visited", "green", true),
            new GroupsModel.Group("Todo", "gold", true),
            new GroupsModel.Group("Excluded", "red", false)
        ]);

        sitesModel.setSites(pubsData.features);

        filterModel.setAllTags(uniqueTags(pubsData.features));
    }

    initialiseMap();
});
