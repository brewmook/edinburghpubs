define(['app/Colour', 'app/ColourMap', 'app/geometry', 'app/View', 'data/pubs'],
function (Colour, ColourMap, geometry, View, pubsData) {

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

    /**
     * @param {Site} site
     * @returns {{name:string, lat:number, lon:number, html:string}}
     */
    function formatForView(site)
    {
        return {
            name: site.history[0].name,
            lat: site.lat,
            lon: site.lon,
            html: bubbleHtml(site)
        };
    }

    /**
     * @param {Site[]} sites
     * @returns {{todo: Site[], blogged: Site[], excluded: Site[]}}
     */
    function categoriseSites(sites)
    {
        var result = {
            todo: [],
            blogged: [],
            excluded: []
        };

        var excludedTags = ['Disqualified', 'Closed', 'Student union', 'Club', 'Restaurant'];

        sites.forEach(function(site) {
            if (site.history.length > 0) {
                var pub = site.history[0];
                if (pub.visits.length > 0 && pub.visits[0].link) {
                    result.blogged.push(site);
                } else if (tagsIntersect(pub.tags, excludedTags)) {
                    result.excluded.push(site);
                } else {
                    result.todo.push(site);
                }
            }
        });

        return result;
    }

    function initialiseMap()
    {
        var origin = pubsData.target.origin;
        var circleRadiusMetres = pubsData.target.radius;

        var view = new View("map");
        view.setTarget(origin, circleRadiusMetres);
        view.setStatusMessage("Calculating...");

        var sites = categoriseSites(pubsData.sites);
        view.addPinsLayer(sites.todo.map(formatForView), "Todo (yellow)", "gold", true);
        view.addPinsLayer(sites.blogged.map(formatForView), "Visited (green)", "green", true);
        view.addPinsLayer(sites.excluded.map(formatForView), "Excluded (red)", "red", false);

        var stats = gatherStatistics(pubsData.sites, 'price');
        var colourMap = new ColourMap();
        colourMap.setOutOfRangeColour(new Colour(64,64,64));
        colourMap.addColour(stats.low, new Colour(0,255,0));
        colourMap.addColour(stats.median, new Colour(0,0,255));
        colourMap.addColour(stats.high, new Colour(255,0,0));

        var colourKey = [
            "Low (green): " + formatPrice(stats.low),
            "Median (blue): " + formatPrice(stats.median),
            "High (red): " + formatPrice(stats.high)
        ];

        var voronoi = geometry.earthSurfaceVoronoi(sites.blogged, origin, circleRadiusMetres);
        view.addVoronoiCellsLayer(
            "Prices",
            colourKey,
            voronoi.map(function(cell) {
                return {
                    polygon: cell.polygon,
                    colour: colourMap.colour(cell.loc.history[0].visits[0].price).toString()
                };
            })
        );
    }

    initialiseMap();
});
