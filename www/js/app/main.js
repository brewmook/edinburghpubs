define(['app/Colour', 'app/ColourMap', 'app/geometry', 'app/Grouper', 'app/ObservableValue',
        'views/View', 'views/SitesView', 'views/VoronoiView',
        'data/pubs'],
function (Colour, ColourMap, geometry, Grouper, ObservableValue,
          View, SitesView, VoronoiView,
          pubsData) {

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

    /**
     * @param {Site} site
     * @return {SitesView.Site}
     */
    function createViewSite(site)
    {
        return new SitesView.Site(
            site.history[0].name,
            site.lat,
            site.lon,
            bubbleHtml(site),
            price(site)
        );
    }

    /**
     * @param labelPrefix
     * @param icon
     * @param visible
     * @param sites
     * @returns {SitesView.Group}
     */
    function createViewGroup(labelPrefix, icon, visible, sites)
    {
        return new SitesView.Group(
            labelPrefix + " (" + icon + "): " + sites.length,
            icon,
            visible,
            sites
        );
    }

    function sitesMatchingTag(sites, filterText) {
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

    /**
     * @param {SitesView.Site[]} sites
     * @param {GeoCoord} origin
     * @param {number} circleRadiusMetres
     * @param {ColourMap} colourMap
     * @returns {VoronoiView.Polygon[]}
     */
    function voronoiPolygons(sites, origin, circleRadiusMetres, colourMap) {
        var voronoi = geometry.earthSurfaceVoronoi(sites, origin, circleRadiusMetres);
        return voronoi.map(function(cell) {
            return new VoronoiView.Polygon(
                cell.polygon,
                colourMap.colour(cell.loc.data)
            );
        });
    }

    function initialiseMap()
    {
        var origin = pubsData.target.origin;
        var circleRadiusMetres = pubsData.target.radius;

        var view = new View();
        view.setStatusMessage("Calculating...");

        var stats = gatherStatistics(pubsData.sites, 'price');
        var colourMap = new ColourMap();
        colourMap.setOutOfRangeColour(new Colour(64,64,64));
        colourMap.addColour(stats.low, new Colour(0,255,0));
        colourMap.addColour(stats.median, new Colour(0,0,255));
        colourMap.addColour(stats.high, new Colour(255,0,0));

        var grouper = new Grouper(createViewSite, createViewGroup);
        grouper.addGroup("Visited", "green", true, isBlogged);
        grouper.addGroup("Todo", "gold", true, function(site) { return !isBlogged(site) && !isExcluded(site); });
        //grouper.addGroup("Excluded", "red", false, function(site) { return !isBlogged(site) && isExcluded(site); });

        var currentGroups = grouper.groupSites(pubsData.sites);

        view.target.setTarget(origin, circleRadiusMetres);
        view.tags.setTags(uniqueTags(pubsData.sites));

        view.sites.visibleGroups.subscribe(function(groupLabels) {
            var groups = currentGroups.filter(function (g) { return inList(g.label, groupLabels); });
            var sites = groups.reduce(function(result, group) { return result.concat(group.sites); }, []);
            var polygons = voronoiPolygons(sites, origin, circleRadiusMetres, colourMap);
            view.voronoi.setPolygons(polygons);
        });

        view.tags.selected.subscribe(function(tag) {
            var sites;
            if (tag == '') {
                sites = pubsData.sites;
            }
            else {
                sites = sitesMatchingTag(pubsData.sites, tag);
            }
            currentGroups = grouper.groupSites(sites);
            view.sites.showGroups(currentGroups);
        });

        view.sites.showGroups(currentGroups);

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
