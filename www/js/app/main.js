define(['app/geometry', 'app/view', 'data/pubs'],
function (geo, View, pubsData) {

    function createLink(url, text)
    {
        return "<a href=\"http://brewmook.wordpress.com" + url + "\">" + text + "</a>";
    }

    function bubbleHtml(pub)
    {
        var text = "<b>" + pub.name + "</b>";
        if ("link" in pub && pub.link != "")
            text = createLink(pub.link, text);
        if ("comment" in pub && pub.comment)
            text += "<br/><em>" + pub.comment + "</em>";
        if ("price" in pub && pub.price > 0)
            text += "<br/>Price: £" + pub.price.toFixed(2);
        if ("previous" in pub) {
            var previous = [];
            for (var i = pub.previous.length-1; i >= 0; --i) {
                previous.push(createLink(pub.previous[i].link, pub.previous[i].name));
            }
            text += "<br/>Previously known as " + previous.join(', ') + ".";
        }
        if ("tags" in pub && pub.tags.length > 0) {
            text += "<br/>Tags: " + pub.tags.join(', ');
        }
        return text;
    }

    function setStatusMessage(html)
    {
        document.getElementById('message').innerHTML = html;
    }

    function displayStats(stats)
    {
        setStatusMessage(
            stats.name + ": <br/>"
            + "Low (green): " + stats.lowString + "<br/>"
            + "Median (blue): " + stats.medianString + "<br/>"
            + "High (red): " + stats.highString
        );
    }

    function round(value)
    {
        return Math.floor(value + 0.5);
    }

    /**
     * @param {number} r - Red component in range 0 to 255.
     * @param {number} g - Green component in range 0 to 255.
     * @param {number} b - Blue component in range 0 to 255.
     * @constructor
     */
    function Colour(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    function interpolate(t, a, b)
    {
        return a + t * (b - a);
    }

    /**
     * Interpolate between two colours.
     *
     * @param {number} t - Interpolation value in range 0 to 1.
     * @param {Colour} low - Colour for t = 0.
     * @param {Colour} high - Colour for t = 1.
     */
    function interpolateColour(t, low, high)
    {
        return new Colour(
            interpolate(t, low.r, high.r),
            interpolate(t, low.g, high.g),
            interpolate(t, low.b, high.b)
        );
    }

    /**
     * Convert to HTML #RRGGBB format.
     *
     * @returns {string}
     */
    Colour.prototype.toString = function()
    {
        var intColour = (round(this.r) << 16) + (round(this.g) << 8) + round(this.b);
        return '#' + ('000000' + intColour.toString(16)).slice(-6);
    };

    /**
     * Maps three colours to the low, median and high value range.
     *
     * @param {number} value
     * @param {{value:number, colour:Colour}} low
     * @param {{value:number, colour:Colour}} median
     * @param {{value:number, colour:Colour}} high
     * @param {Colour} outOfRange
     * @returns {Colour}
     */
    function colourDualLinear(value, low, median, high, outOfRange)
    {
        var colour;
        if (value < low.value || value > high.value) {
            colour = outOfRange;
        } else if (value < median.value) {
            colour = interpolateColour(
                (value - low.value) / (median.value-low.value),
                low.colour,
                median.colour
            );
        } else {
            colour = interpolateColour(
                (value - median.value) / (high.value-median.value),
                median.colour,
                high.colour
            );
        }
        return colour;
    }

    /**
     * Extract some statistics about some values within a list of objects.
     *
     * @param {Object[]} objects
     * @param {string} key
     * @param {string} name
     * @param {function} format
     * @returns {{low:*, high:*, median:*, name:string, lowString:string, medianString:string, highString:string}}
     */
    function createStatistics(objects, key, name, format)
    {
        var values = objects
            .filter(function(pub){return (key in pub) && (pub[key] > 0);})
            .map(function(x){return x[key];})
            .sort();

        var low = values[0];
        var high = values[values.length-1];
        var median = values[Math.floor(values.length/2)];

        return {
            low: low,
            high: high,
            median: median,
            name: name,
            lowString: format(low),
            medianString: format(median),
            highString: format(high)
        };
    }

    function hasTag(pub, tags)
    {
        return "tags" in pub && pub.tags.some(function(pubTag) {
            return tags.some(function(tag) {
                return tag == pubTag;
            });
        });
    }

    function formatPubForView(pub, stats)
    {
        return {
            name: pub.name,
            lat: pub.lat,
            lon: pub.lon,
            html: bubbleHtml(pub),
            colour: colourDualLinear(
                pub.price,
                {value:stats.low, colour:new Colour(0,255,0)},
                {value:stats.median, colour:new Colour(0,0,255)},
                {value:stats.high, colour:new Colour(255,0,0)},
                new Colour(64,64,64)
            ).toString()
        };
    }

    function initialiseMap()
    {
        setStatusMessage("Calculating...");

        var origin = new geo.GeoCoord(55.94816654144937, -3.1994622945785522);
        var circleRadiusMetres = 1609;

        var view = new View("map");
        view.setTarget(origin, circleRadiusMetres);

        var stats = createStatistics(pubsData, 'price', 'Prices', function(x){ return "£"+x.toFixed(2); });

        var todo = [];
        var blogged = [];
        var excluded = [];

        pubsData.forEach(function(pub) {
            if (pub.link) {
                blogged.push(formatPubForView(pub, stats));
            } else if (hasTag(pub, ['Disqualified','Closed','Student union','Club','Restaurant'])) {
                excluded.push(formatPubForView(pub, stats));
            } else {
                todo.push(formatPubForView(pub, stats));
            }
        });

        view.addPinsLayer(todo, "Todo (yellow)", "gold", true);
        view.addPinsLayer(blogged, "Visited (green)", "green", true);
        view.addPinsLayer(excluded, "Excluded (red)", "red", false);

        displayStats(stats);

        var sites = geo.earthSurfaceVoronoi(blogged, origin, circleRadiusMetres);
        view.addVoronoiCellsLayer(
            sites.map(function(site) {
                return {
                    polygon: site.polygon,
                    colour: site.loc.colour
                };
            }),
            stats.name
        );
    }

    initialiseMap();
});
