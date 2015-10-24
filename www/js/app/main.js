define(['app/Colour', 'app/ColourMap', 'app/geometry', 'app/ObservableValue', 'views/View', 'views/VoronoiView', 'views/TagsView', 'views/SiteViewModel', 'data/pubs'],
function (Colour, ColourMap, geometry, ObservableValue, View, VoronoiView, TagsView, SiteViewModel, pubsData) {

    /**
     * @constructor
     */
    function Target() {
        this.origin = new GeoCoord(0,0);
        this.radius = 0;
    }

    /**
     * @constructor
     */
    function Visit() {
        this.date = '';
        this.price = 0;
        this.link = '';
        this.comment = '';
    }

    /**
     * @constructor
     */
    function Pub() {
        this.name = '';
        this.opened = '';
        this.closed = '';
        /** @type {string[]} */
        this.tags = [];
        /** @type {Visit[]} */
        this.visits = [];
    }

    /**
     * @constructor
     */
    function Site() {
        this.lat = 0;
        this.lon = 0;
        /** @type {Pub[]} */
        this.history = [];
    }

    /**
     * @param {number} price
     * @returns {string}
     */
    function formatPrice(price) {
        return "£"+price.toFixed(2);
    }

    /**
     * @param {string} url
     * @param {string} text
     * @returns {string}
     */
    function createLink(url, text)
    {
        return "<a href=\"http://brewmook.wordpress.com" + url + "\">" + text + "</a>";
    }

    /**
     * @param {Site} site
     * @returns {string}
     */
    function bubbleHtml(site)
    {
        var pub = site.history[0];
        var text = "<b>" + pub.name + "</b>";
        if (pub.visits.length > 0) {
            var visit = pub.visits[0];
            if (visit.link)
                text = createLink(visit.link, text);
            if (visit.comment)
                text += "<br/><em>" + visit.comment + "</em>";
            if (visit.price > 0)
                text += "<br/>Price: " + formatPrice(visit.price);
        }
        if (site.history.length > 1) {
            var previous = [];
            var link;
            for (var i = 1; i < site.history.length; ++i) {
                link = site.history[i].visits.length ? site.history[i].visits[0].link : '';
                previous.push(createLink(link, site.history[i].name));
            }
            text += "<br/>Previously known as " + previous.join(', ') + ".";
        }
        if (pub.tags.length > 0) {
            text += "<br/>Tags: " + pub.tags.join(', ');
        }
        return text;
    }

    /**
     * Extract some statistics about some values within a list of objects.
     *
     * @param {Site[]} sites
     * @param {string} key
     * @returns {{low:*, high:*, median:*}}
     */
    function gatherStatistics(sites, key)
    {
        var values = sites
            .filter(function(site){return site.history.length>0 && site.history[0].visits.length>0;})
            .map(function(site){return site.history[0].visits[0];})
            .filter(function(object){return (key in object) && (object[key] > 0);})
            .map(function(x){return x[key];})
            .sort();

        var low = values[0];
        var high = values[values.length-1];
        var median = values[Math.floor(values.length/2)];

        return {
            low: low,
            high: high,
            median: median
        };
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
        var excludedTags = ['Disqualified', 'Closed', 'Student union', 'Club', 'Restaurant'];
        return site.history.length
            && tagsIntersect(site.history[0].tags, excludedTags);
    }

    function categorise(site) {
        if (isBlogged(site)) {
            return "blogged";
        }
        else if (isExcluded(site)) {
            return "excluded";
        }
        else {
            return "todo";
        }
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

    /**
     * @param {Site} site
     * @return {SiteViewModel}
     */
    function createSiteViewModel(site)
    {
        return new SiteViewModel(
            site.history[0].name,
            site.lat,
            site.lon,
            bubbleHtml(site)
        );
    }

    function defaultGroups(sites) {
        var todo = { id: "todo", label: "Todo", icon: "gold", visible: true, sites: [] };
        var excluded = { id: "excluded", label: "Excluded", icon: "red", visible: false, sites: [] };
        var visited = { id: "visited", label: "Visited", icon: "green", visible: true, sites: [] };

        sites.forEach(function(site) {
            if (isBlogged(site)) {
                visited.sites.push(createSiteViewModel(site));
            }
            else if (isExcluded(site)) {
                excluded.sites.push(createSiteViewModel(site));
            }
            else {
                todo.sites.push(createSiteViewModel(site));
            }
        });

        return [visited, todo, excluded];
    }

    function findSitesInDefaultGroups(sites, groupIds)
    {
        var result = [];

        var visited = inList('visited', groupIds);
        var excluded = inList('excluded', groupIds);
        var todo = inList('todo', groupIds);

        sites.forEach(function(site) {
            if (isBlogged(site)) {
                if (visited) result.push(site);
            }
            else if (isExcluded(site)) {
                if (excluded) result.push(site);
            }
            else {
                if (todo) result.push(site);
            }
        });

        return result;
    }

    function findSitesWithMatchingTag(sites, filterText) {
        return sites.filter(function(site) {
            return inList(filterText, site.history[0].tags);
        });
    }

    function price(site) {
        if (site.history.length > 0 && site.history[0].visits.length > 0)
            return site.history[0].visits[0].price;
        return 0;
    }

    /**
     * @param {string} group
     * @param {string[]} groups
     * @returns {boolean}
     */
    function inList(group, groups) {
        return groups.indexOf(group) != -1;
    }

    function voronoiPolygons(sites, origin, circleRadiusMetres, colourMap) {
        var voronoi = geometry.earthSurfaceVoronoi(sites, origin, circleRadiusMetres);
        return voronoi.map(function(cell) {
            return {
                points: cell.polygon,
                colour: colourMap.colour(price(cell.loc)).toString()
            };
        });
    }

    function initialiseMap()
    {
        var origin = pubsData.target.origin;
        var circleRadiusMetres = pubsData.target.radius;

        var view = new View();
        view.setTarget(origin, circleRadiusMetres);
        view.setStatusMessage("Calculating...");

        var voronoiView = new VoronoiView(view._map);
        var tagsView = new TagsView(uniqueTags(pubsData.sites));

        var stats = gatherStatistics(pubsData.sites, 'price');
        var colourMap = new ColourMap();
        colourMap.setOutOfRangeColour(new Colour(64,64,64));
        colourMap.addColour(stats.low, new Colour(0,255,0));
        colourMap.addColour(stats.median, new Colour(0,0,255));
        colourMap.addColour(stats.high, new Colour(255,0,0));

        var visibleSites = new ObservableValue([]);

        // When the visible sites change, update the voronoi cells in the view.
        visibleSites.subscribe(function(sites) {
            var polygons = voronoiPolygons(sites, origin, circleRadiusMetres, colourMap);
            voronoiView.setPolygons(polygons);
        });

        // Whenever the groups change, recalculate visible sites.
        view.visibleGroups.subscribe(function(visibleGroups) {
            if (tagsView.selected.get() == '') {
                visibleSites.set(findSitesInDefaultGroups(pubsData.sites, visibleGroups));
            }
        });

        // Whenever the filter text changes, search for matching pubs
        tagsView.selected.subscribe(function(tag) {
            if (tag == '') {
                view.setGroups(defaultGroups(pubsData.sites), true);
            }
            else {
                var sites = findSitesWithMatchingTag(pubsData.sites, tag);
                var group = {
                    id: "filtered",
                    label: "Filtered",
                    icon: "green",
                    visible: true,
                    sites: sites.map(createSiteViewModel)
                };
                view.setGroups([group], false);
                visibleSites.set(sites);
            }
        });

        view.setGroups(defaultGroups(pubsData.sites), true);

        // Just use status message area for now to display the voronoi legend.
        var colourKeyStrings = [
            "Low (green): " + formatPrice(stats.low),
            "Median (blue): " + formatPrice(stats.median),
            "High (red): " + formatPrice(stats.high)
        ];
        view.setStatusMessage("Prices:<br/>" + colourKeyStrings.join("<br/>"));

    }

    initialiseMap();
});
