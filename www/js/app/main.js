define(['app/Colour', 'app/ColourMap', 'app/geometry', 'app/View', 'data/pubs'],
function (Colour, ColourMap, geometry, View, pubsData) {

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

    /**
     * @param {Site} site
     * @returns {{name:string, lat:number, lon:number, html:string}}
     */
    function SiteViewModel(site)
    {
        var group = categorise(site);

        return {
            name: site.history[0].name,
            lat: site.lat,
            lon: site.lon,
            html: bubbleHtml(site),
            group: group,
            site: site
        };
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

    function initialiseMap()
    {
        var origin = pubsData.target.origin;
        var circleRadiusMetres = pubsData.target.radius;

        var view = new View("map");
        view.setTarget(origin, circleRadiusMetres);
        view.setStatusMessage("Calculating...");

        var stats = gatherStatistics(pubsData.sites, 'price');
        var colourMap = new ColourMap();
        colourMap.setOutOfRangeColour(new Colour(64,64,64));
        colourMap.addColour(stats.low, new Colour(0,255,0));
        colourMap.addColour(stats.median, new Colour(0,0,255));
        colourMap.addColour(stats.high, new Colour(255,0,0));

        var groups = {
            todo: { label: "Todo", icon: "gold", visible: true },
            excluded: { label: "Excluded", icon: "red", visible: false },
            blogged: { label: "Visited", icon: "green", visible: true }
        };

        var viewSites = pubsData.sites.map(function(site) { return new SiteViewModel(site); });
        view.setGroupedSites(viewSites, groups);

        // Whenever the groups change, recalculate the voronoi cells and repopulate the view.
        view.visibleGroups.subscribe(function(visibleGroups) {
            var visible = viewSites.filter(function(vm) { return inList(vm.group, visibleGroups); });
            var voronoi = geometry.earthSurfaceVoronoi(visible, origin, circleRadiusMetres);
            var polygons = voronoi.map(function(cell) {
                return {
                    points: cell.polygon,
                    colour: colourMap.colour(price(cell.loc.site)).toString()
                };
            });
            view.setVoronoiPolygons(polygons);
        });

        // Whenever the filter text changes, search for matching pubs
        view.filterText.subscribe(function(filterText) {
            if (filterText == '') {
                view.setGroupedSites(viewSites, groups);
            }
            else {
                var matches = viewSites.filter(function(viewSite) {
                    return inList(filterText, viewSite.site.history[0].tags);
                });
                matches.forEach(function(viewSite) {
                    console.log(viewSite.site.history[0].name);
                });
                view.setAllSites(matches);
            }
        });

        // First time around, kive the visible groups a kick.
        view.visibleGroups.notify();

        // Just use status message area for now to display the voronoi legend.
        var colourKeyStrings = [
            "Low (green): " + formatPrice(stats.low),
            "Median (blue): " + formatPrice(stats.median),
            "High (red): " + formatPrice(stats.high)
        ];
        view.setStatusMessage("Prices:<br/>" + colourKeyStrings.join("<br/>"));

        var tags = {};
        pubsData.sites.forEach(function(site) {
            var siteTags = site.history[0].tags;
            siteTags.forEach(function(tag) {
                if (!tags.hasOwnProperty(tag)) {
                    tags[tag] = 0;
                }
            });
        });
        view.setTags(Object.keys(tags).sort());
    }

    initialiseMap();
});
