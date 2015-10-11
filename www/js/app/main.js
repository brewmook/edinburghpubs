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
            + "Low (green): " + stats.format(stats.low) + "<br/>"
            + "Median (blue): " + stats.format(stats.median) + "<br/>"
            + "High (red): " + stats.format(stats.high)
        );
    }

    function round(value)
    {
        return Math.floor(value + 0.5);
    }

    function colourDualLinear(value, low, high, median)
    {
        var red, green, blue, normalised;
        if (value < low) {
            return "#555555";
        } else if (value < median) {
            normalised = (value - low) / (median-low);
            green = round(255 * (1 - normalised));
            blue = round(255 * normalised);
            red = 0;
        } else {
            normalised = (value - median) / (high-median);
            red = round(255 * normalised);
            blue = round(255 * (1 - normalised));
            green = 0;
        }
        return '#' + ('000000' + ((red << 16) + (green<<8) + blue).toString(16)).slice(-6);
    }

    function priceStats(pubs)
    {
        var low = Number.MAX_VALUE;
        var high = Number.MIN_VALUE;
        var prices = [];
        pubs.forEach(function(pub)
        {
            if ("price" in pub && pub.price > 0) {
                low = Math.min(low, pub.price);
                high = Math.max(high, pub.price);
                prices.push(pub.price);
            }
        });
        prices.sort();
        return {
            name: 'Prices',
            low: low,
            high: high,
            median: prices[Math.floor(prices.length/2)],
            format:function(value) { return "£" + value.toFixed(2); }
        }
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
            colour: colourDualLinear(pub.price, stats.low, stats.high, stats.median)
        };
    }

    function initialiseMap()
    {
        setStatusMessage("Calculating...");

        var origin = new geo.GeoCoord(55.94816654144937, -3.1994622945785522);
        var circleRadiusMetres = 1609;

        var view = new View("map");
        view.setTarget(origin, circleRadiusMetres);

        var stats = priceStats(pubsData);

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
