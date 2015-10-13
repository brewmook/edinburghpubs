define(['app/Colour', 'app/ColourMap', 'app/GeoCoord', 'app/geometry', 'app/View', 'data/pubs'],
function (Colour, ColourMap, GeoCoord, geometry, View, pubsData) {

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
     * @returns {{name:string, lat:number, lon:number, html:string}}
     */
    function formatForView(pub)
    {
        return {
            name: pub.name,
            lat: pub.lat,
            lon: pub.lon,
            html: bubbleHtml(pub)
        };
    }

    function formatPrice(price)
    {
        return "£"+price.toFixed(2);
    }

    function categorisePubs(pubs)
    {
        var result = {
            todo: [],
            blogged: [],
            excluded: []
        };

        pubs.forEach(function(pub) {
            if (pub.link) {
                result.blogged.push(pub);
            } else if (hasTag(pub, ['Disqualified','Closed','Student union','Club','Restaurant'])) {
                result.excluded.push(pub);
            } else {
                result.todo.push(pub);
            }
        });

        return result;
    }

    function initialiseMap()
    {
        var origin = new GeoCoord(55.94816654144937, -3.1994622945785522);
        var circleRadiusMetres = 1609;

        var view = new View("map");
        view.setTarget(origin, circleRadiusMetres);
        view.setStatusMessage("Calculating...");

        var pubs = categorisePubs(pubsData);
        view.addPinsLayer(pubs.todo.map(formatForView), "Todo (yellow)", "gold", true);
        view.addPinsLayer(pubs.blogged.map(formatForView), "Visited (green)", "green", true);
        view.addPinsLayer(pubs.excluded.map(formatForView), "Excluded (red)", "red", false);

        var stats = createStatistics(pubsData, 'price');
        var colourMap = new ColourMap();
        colourMap.setOutOfRangeColour(new Colour(64,64,64));
        colourMap.addColour(stats.low, new Colour(0,255,0));
        colourMap.addColour(stats.median, new Colour(0,0,255));
        colourMap.addColour(stats.high, new Colour(255,0,0));

        var sites = geometry.earthSurfaceVoronoi(pubs.blogged, origin, circleRadiusMetres);
        view.addVoronoiCellsLayer(
            sites.map(function(site) {
                return {
                    polygon: site.polygon,
                    colour: colourMap.colour(site.loc.price).toString()
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
