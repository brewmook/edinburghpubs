require(['leaflet', 'voronoi', '../../data/overpassData', '../../data/extraPubsData', '../../data/visitData'],
function (leaflet, Voronoi, overpassData, extraPubsData, visitDataArray) {

    function createMap(lat, lon)
    {
        var map = leaflet.map('map').setView([lat, lon], 13);
        var osmAttr = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
        leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: osmAttr
        }).addTo(map);
        return map;
    }

    function postLink(pub)
    {
        var text = pub.name;
        if ("link" in pub && pub.link != "")
            text = "<a href=\"http://brewmook.wordpress.com" + pub.link + "\">" + pub.name + "</a>";
        if ("statusinfo" in pub && pub.statusinfo != undefined)
            text += "<br/><em>" + pub.statusinfo + "</em>";
        if ("x" in pub && pub.x !== undefined)
            text += "<br/>{x:" + pub.x.toFixed(2) + ", y:"+pub.y.toFixed(2)+"}";
        if ("price" in pub && pub.price > 0)
            text += "<br/>Price: £" + pub.price;
        return text;
    }

    function addFlag(layer, pub, icon)
    {
        var marker = leaflet.marker([pub.lat, pub.lon],
            { "title": pub.name,
                "icon": icon });
        marker.addTo(layer);
        marker.bindPopup(postLink(pub));
    }

    function displayTotals(donePubs, todoPubs, stats)
    {
        var done = donePubs.length;
        var total = done + todoPubs.length;
        var message = document.getElementById('message');
        message.innerHTML =
            "Total " + total + " pubs<br/>"
            + stats.name + ": <br/>"
            + "Low (green): " + stats.unitsPrefix + stats.low + "<br/>"
            + "High (red): " + stats.unitsPrefix + stats.high + "<br/>"
            + "Median (blue): " + stats.unitsPrefix + stats.median
    }

    function addTargetToMap(target, map, layersControl)
    {
        var layer = new leaflet.LayerGroup().addTo(map);
        var circle = new leaflet.circle(
            [target.lat, target.lon],
            target.radiusMetres,
            {
                color: '#c80',
                opacity: 1,
                fill: false
            });
        layer.addLayer(circle);
        layer.addLayer(new leaflet.circle(
            [target.lat, target.lon],
            1.0,
            {
                color: '#f00',
                opacity: 1,
                fillColor: '#f00',
                fillOpacity: 1
            }));
        layersControl.addOverlay(layer, "Target area");
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

    function getVisitData(visitData)
    {
        var result = {};
        for (var i in visitData)
        {
            result[visitData[i][0]] = {
                "name":   visitData[i][1],
                "status": visitData[i][2].split(":")[0],
                "statusinfo": visitData[i][2].split(":")[1],
                "link":   visitData[i][3],
                "price":  visitData[i][4]
            };
        }
        return result;
    }

    function mergeVisitData(visitData, pub)
    {
        if (pub.id in visitData)
        {
            pub.status = visitData[pub.id].status;
            pub.statusinfo = visitData[pub.id].statusinfo;
            pub.name = visitData[pub.id].name;
            pub.link = visitData[pub.id].link;
            pub.price = visitData[pub.id].price;
        }
        return pub;
    }

    function dictionaryToArray(dictionary)
    {
        var result = [];
        for (var i in dictionary) {
            result.push(dictionary[i]);
        }
        return result;
    }

    function getPubs()
    {
        var dictionary = {};
        var allPubs = overpassData.concat(extraPubsData);
        var visitData = getVisitData(visitDataArray);

        for (var i in allPubs)
        {
            var pub = mergeVisitData(visitData, allPubs[i]);
            dictionary[pub.id] = pub;
        }

        return dictionaryToArray(dictionary);
    }

    function filterByStatus(pubs, statuses)
    {
        return pubs.filter(function(pub) {
            return statuses.some(function(status) { return status == pub.status; });
        });
    }

    function filterByLink(pubs, linkRegEx)
    {
        return pubs.filter(function(pub) {
            return linkRegEx.test(pub.link);
        });
    }

    function addPubsAsLayer(pubs, layerName, icon, map, layersControl)
    {
        var layer = new leaflet.LayerGroup().addTo(map);
        pubs.forEach(function(pub) {
            addFlag(layer, pub, icon);
        });
        layersControl.addOverlay(layer, layerName + ": " + pubs.length);
    }

    function calculateCartesian(locations, t, r)
    {
        var degToRad = Math.PI/180.0;
        var rotation = t.lat * degToRad;
        var cosRotation = Math.cos(rotation);
        var sinRotation = Math.sin(rotation);

        return locations.forEach(function(loc) {
            var theta = (90 - loc.lat) * degToRad;
            var phi = (loc.lon - t.lon) * degToRad;

            // to 3d cartesian coordinates
            var sinTheta = Math.sin(theta);
            var x = r * sinTheta * Math.cos(phi);
            var y = r * sinTheta * Math.sin(phi);
            var z = r * Math.cos(theta);

            // rotate down to equator
            var newZ = z * cosRotation - x * sinRotation;
            var newX = z * sinRotation + x * cosRotation;

            // project onto new xy orientation
            loc.x = y;
            loc.y = newZ;
            loc.z = newX;
        });
    }

    function cartesianToLatLng(locations, t, r)
    {
        var degToRad = Math.PI/180.0;
        var radToDeg = 180.0/Math.PI;
        var rotation = -t.lat * degToRad;
        var cosRotation = Math.cos(rotation);
        var sinRotation = Math.sin(rotation);

        return locations.map(function(loc) {
            var rotatedX = loc.z;
            var rotatedZ = loc.y;
            var y = loc.x;

            // unrotate back up to correct latitude
            var z = rotatedZ * cosRotation - rotatedX * sinRotation;
            var x = rotatedZ * sinRotation + rotatedX * cosRotation;

            var theta = Math.acos(z/r) * radToDeg;
            var phi = Math.atan(y/x) * radToDeg;

            return {
                lat: 90.0 - theta,
                lng: phi + t.lon
            };
        });
    }

    function computeVoronoi(locations, t, r)
    {
        var margin = t.radiusMetres + 100;
        var bbox = {
            xl: -margin,
            xr: margin,
            yt: -margin,
            yb: margin
        };

        calculateCartesian(locations, t, r);

        var voronoi = new Voronoi();
        var results = voronoi.compute(locations, bbox);

        results.cells.forEach(function(cell) {
            var pub = cell.site;
            var cartesians = cell.halfedges.map(function (edge) {
                var start = edge.getStartpoint();
                return {x:start.x, y:start.y, z:r};
            });
            pub.voronoiPolygon = cartesianToLatLng(cartesians, t, r);
        });
    }

    function round(value)
    {
        return Math.floor(value + 0.5);
    }

    function colourDualLinear(value, low, high, median)
    {
        var red, green, blue;
        if (value < low) {
            return "#555555";
        } else if (value < median) {
            var normalised = (value - low) / (median-low);
            green = round(255 * (1 - normalised));
            blue = round(255 * normalised);
            red = 0;
        } else {
            var normalised = (value - median) / (high-median);
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
            if (pub.price > 0) {
                low = Math.min(low, pub.price);
                high = Math.max(high, pub.price);
                prices.push(pub.price);
            }
        });
        prices.sort();
        return {
            unitsPrefix: '£',
            name: 'Price',
            low: low,
            high: high,
            median: prices[Math.floor(prices.length/2)]
        }
    }

    function addVoronoiCellsAsLayer(pubs, map, layersControl, stats)
    {
        var layer = new leaflet.LayerGroup().addTo(map);
        pubs.forEach(function(pub) {
            L.polygon(pub.voronoiPolygon, {
                fillColor: colourDualLinear(pub.price, stats.low, stats.high, stats.median),
                stroke: false,
                fillOpacity: 0.6
            }).addTo(layer);
        });
        layersControl.addOverlay(layer, stats.name);
    }

    function initialiseMap()
    {
        var target = {
            lat:55.94816654144937,
            lon:-3.1994622945785522,
            radiusMetres:1609
        };
        var map = createMap(target.lat, target.lon);
        var layersControl = leaflet.control.layers(null, null, { "position":"bottomright", "collapsed": false }).addTo(map);

        addTargetToMap(target, map, layersControl);
        var icons = createIcons();

        var allPubs = getPubs();

        var todoPubs = filterByStatus(allPubs, [undefined]);
        //addPubsAsLayer(todoPubs, "Todo (yellow)", icons.gold, map, layersControl);

        var donePubs = filterByStatus(allPubs, ["done"]);
        computeVoronoi(donePubs, target, 6378137);

        var visitedPubs = filterByLink(donePubs, /^$/);
        //addPubsAsLayer(visitedPubs, "Visited (blue)", icons.blue, map, layersControl);

        var bloggedPubs = filterByLink(donePubs, /.+/);
        addPubsAsLayer(bloggedPubs, "Pubs", icons.green, map, layersControl);

        var excludedPubs = filterByStatus(allPubs, ["closed","disqualified"]);
        //addPubsAsLayer(excludedPubs, "Excluded (red)", icons.red, map, layersControl);

        var stats = priceStats(donePubs);
        addVoronoiCellsAsLayer(donePubs, map, layersControl, stats);

        displayTotals(donePubs, todoPubs, stats);
    }

    initialiseMap();
});
