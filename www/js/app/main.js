define(['app/geometry', 'leaflet', 'data/pubs'],
function (geo, leaflet, pubsData) {

    /**
     * Set up the Leaflet map and target area.
     *
     * @param {GeoCoord} origin - The map origin.
     * @param {number} circleRadius - The circle radius in metres for target area.
     * @returns {Object} The Leaflet map instance.
     */
    function createMap(origin, circleRadius)
    {
        // The map itself
        var map = leaflet.map('map').setView(origin, 13);

        // Open Street Map attribution
        var osmAttr = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
        leaflet.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
            attribution: osmAttr
        }).addTo(map);

        // Add the target area circle
        var layer = new leaflet.LayerGroup().addTo(map);
        var circle = new leaflet.circle(
            origin,
            circleRadius,
            {
                color: '#c80',
                opacity: 1,
                fill: false
            });
        layer.addLayer(circle);

        // Add a spot right in the middle
        layer.addLayer(new leaflet.circle(
            origin,
            1.0,
            {
                color: '#f00',
                opacity: 1,
                fillColor: '#f00',
                fillOpacity: 1
            }));

        return map;
    }

    function addFlag(layer, location, title, icon, bubbleContent)
    {
        var marker = leaflet.marker(location, { "title": title, "icon": icon });
        marker.addTo(layer);
        marker.bindPopup(bubbleContent);
    }

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

    function createIcons()
    {
        // Setup icons
        var Icon = leaflet.Icon.extend({
            options: {
                iconSize: [25, 39],
                iconAnchor:   [12, 36],
                popupAnchor: [0, -30]
            }
        });
        var icons = ["gold", "blue", "red", "green"];
        return icons.reduce(function(obj, icon) {
            obj[icon] = new Icon({
                iconUrl: "img/marker-"+icon+".png",
                iconRetinaUrl: "img/marker-"+icon+"-2x.png" });
            return obj;
        }, {});
    }

    function addPubsAsLayer(pubs, layerName, icon, layersControl)
    {
        var layer = new leaflet.LayerGroup();
        pubs.forEach(function(pub) {
            addFlag(layer, [pub.lat, pub.lon], pub.name, icon, bubbleHtml(pub));
        });
        layersControl.addOverlay(layer, layerName + ": " + pubs.length);
        return layer;
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

    function addVoronoiCellsAsLayer(sites, map, layersControl, stats)
    {
        var layer = new leaflet.LayerGroup().addTo(map);
        sites.forEach(function(site) {
            leaflet.polygon(
                site.polygon.map(function(coord) { return new leaflet.LatLng(coord.lat, coord.lon); }),
                {
                    fillColor: colourDualLinear(site.colour, stats.low, stats.high, stats.median),
                    stroke: false,
                    fillOpacity: 0.5
                }
            ).addTo(layer);
        });
        layersControl.addOverlay(layer, stats.name);
    }

    function hasTag(pub, tags)
    {
        return "tags" in pub && pub.tags.some(function(pubTag) {
            return tags.some(function(tag) {
                return tag == pubTag;
            });
        });
    }

    function initialiseMap()
    {
        setStatusMessage("Calculating...");

        var origin = new geo.GeoCoord(55.94816654144937, -3.1994622945785522);
        var circleRadiusMetres = 1609;

        var map = createMap(origin, circleRadiusMetres);
        var layersControl = leaflet.control.layers(null, null, { position:"bottomright", collapsed: false }).addTo(map);

        var icons = createIcons();

        var todoPubs = [];
        var bloggedPubs = [];
        var excludedPubs = [];

        pubsData.forEach(function(pub) {
            if (pub.link) {
                bloggedPubs.push(pub);
            } else if (hasTag(pub, ['Disqualified','Closed','Student union','Club','Restaurant'])) {
                excludedPubs.push(pub);
            } else {
                todoPubs.push(pub);
            }
        });

        addPubsAsLayer(todoPubs, "Todo (yellow)", icons.gold, layersControl).addTo(map);
        addPubsAsLayer(bloggedPubs, "Visited (green)", icons.green, layersControl).addTo(map);
        addPubsAsLayer(excludedPubs, "Excluded (red)", icons.red, layersControl);

        var stats = priceStats(pubsData);
        displayStats(stats);

        var sites = geo.earthSurfaceVoronoi(bloggedPubs, origin, circleRadiusMetres);
        addVoronoiCellsAsLayer(
            sites.map(function(site) {
                return {
                    polygon: site.polygon,
                    colour: site.loc.price
                };
            }),
            map,
            layersControl,
            stats
        );
    }

    initialiseMap();
});
