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
     * @constructor
     */
    function ColourMap()
    {
        /** @type {{value:number, colour:Colour}[]} */
        this._colours = [];
        /** @type {!Colour} */
        this._outOfRangeColour = null;
    }

    /**
     * @param {number} value
     * @returns {number} The index into [this._colours].
     * @private
     */
    ColourMap.prototype._upperBound = function(value)
    {
        var i = 0;
        while (i < this._colours.length && value < this._colours[i].value) {
            ++i;
        }
        return i;
    };

    /**
     * @param {number} value
     * @param {Colour} colour
     */
    ColourMap.prototype.addColour = function(value, colour)
    {
        var i = this._upperBound(value);
        this._colours.splice(i, 0, {value:value, colour:colour});
    };

    /**
     * @param {?Colour} colour
     */
    ColourMap.prototype.setOutOfRangeColour = function(colour)
    {
        this._outOfRangeColour = colour;
    };

    /**
     * @param {number} value
     * @returns {Colour}
     */
    ColourMap.prototype.colour = function(value)
    {
        var i = this._upperBound(value);

        if (i == 0) {
            return this._outOfRangeColour || this._colours[0].value;
        }
        else if (i == this._colours.length) {
            return this._outOfRangeColour || this._colours[i-1].colour;
        }

        var low = this._colours[i-1];
        var high = this._colours[i];
        return interpolateColour(
            (value - low.value) / (high.value - low.value),
            low.colour,
            high.colour
        );
    };

    /**
     * Extract some statistics about some values within a list of objects.
     *
     * @param {Object[]} objects
     * @param {string} key
     * @returns {{low:*, high:*, median:*}}
     */
    function createStatistics(objects, key)
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
            median: median
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

    /**
     * @param {Object} pub
     * @param {ColourMap} colourMap
     * @returns {{name:string, lat:number, lon:number, html:string, colour:string}}
     */
    function formatPubForView(pub, colourMap)
    {
        return {
            name: pub.name,
            lat: pub.lat,
            lon: pub.lon,
            html: bubbleHtml(pub),
            colour: colourMap ? colourMap.colour(pub.price).toString() : ''
        };
    }

    function formatPrice(price)
    {
        return "£"+price.toFixed(2);
    }

    function initialiseMap()
    {
        var origin = new geo.GeoCoord(55.94816654144937, -3.1994622945785522);
        var circleRadiusMetres = 1609;

        var view = new View("map");
        view.setTarget(origin, circleRadiusMetres);
        view.setStatusMessage("Calculating...");

        var stats = createStatistics(pubsData, 'price');

        var colourMap = new ColourMap();
        colourMap.setOutOfRangeColour(new Colour(64,64,64));
        colourMap.addColour(stats.low, new Colour(0,255,0));
        colourMap.addColour(stats.median, new Colour(0,0,255));
        colourMap.addColour(stats.high, new Colour(255,0,0));

        var todo = [];
        var blogged = [];
        var excluded = [];

        pubsData.forEach(function(pub) {
            if (pub.link) {
                blogged.push(formatPubForView(pub, colourMap));
            } else if (hasTag(pub, ['Disqualified','Closed','Student union','Club','Restaurant'])) {
                excluded.push(formatPubForView(pub, null));
            } else {
                todo.push(formatPubForView(pub, null));
            }
        });

        view.addPinsLayer(todo, "Todo (yellow)", "gold", true);
        view.addPinsLayer(blogged, "Visited (green)", "green", true);
        view.addPinsLayer(excluded, "Excluded (red)", "red", false);

        var sites = geo.earthSurfaceVoronoi(blogged, origin, circleRadiusMetres);
        view.addVoronoiCellsLayer(
            sites.map(function(site) {
                return {
                    polygon: site.polygon,
                    colour: site.loc.colour
                };
            })
        );

        view.setStatusMessage(
            "Price" + ": <br/>"
            + "Low (green): " + formatPrice(stats.low) + "<br/>"
            + "Median (blue): " + formatPrice(stats.median) + "<br/>"
            + "High (red): " + formatPrice(stats.high)
        );

    }

    initialiseMap();
});
