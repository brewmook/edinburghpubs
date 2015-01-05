define(['leaflet', 'voronoi', 'data/pubs'],
function (leaflet, Voronoi, pubsData) {

    function createMap(lat, lon)
    {
        var map = leaflet.map('map').setView([lat, lon], 13);
        var osmAttr = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
        leaflet.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
            attribution: osmAttr
        }).addTo(map);
        return map;
    }

    function createLink(url, text)
    {
        return "<a href=\"http://brewmook.wordpress.com" + url + "\">" + text + "</a>";
    }

    function postLink(pub)
    {
        var text = pub.name;
        if ("link" in pub && pub.link != "")
            text = createLink(pub.link, pub.name);
        if ("statusinfo" in pub && pub.statusinfo != undefined)
            text += "<br/><em>" + pub.statusinfo + "</em>";
        if ("price" in pub && pub.price > 0)
            text += "<br/>Price: £" + pub.price.toFixed(2);
        if ("previous" in pub) {
            var previous = [];
            for (var i = pub.previous.length-1; i >= 0; --i) {
                previous.push(createLink(pub.previous[i].link, pub.previous[i].name));
            }
            text += "<br/>Previously known as " + previous.join(', ') + ".";
        }
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

    function addTargetToMap(target, map)
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

    function addPubsAsLayer(pubs, layerName, icon, layersControl)
    {
        var layer = new leaflet.LayerGroup();
        pubs.forEach(function(pub) {
            addFlag(layer, pub, icon);
        });
        layersControl.addOverlay(layer, layerName + ": " + pubs.length);
        return layer;
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
            loc.y = -newZ;
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
            var rotatedZ = -loc.y;
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

    function quadrance(point)
    {
        return point.x*point.x + point.y*point.y;
    }

    // Find the points of intersection.
    function findLineCircleIntersections(radius, point1, point2)
    {
        var dx = point2.x - point1.x;
        var dy = point2.y - point1.y;

        var A = dx * dx + dy * dy;
        var B = 2 * (dx * point1.x + dy * point1.y);
        var C = quadrance(point1) - radius * radius;

        var det = B * B - 4 * A * C;
        if ((A <= 0.0000001) || (det < 0))
        {
            // no solution
            return null;
        }
        else if (det == 0)
        {
            // One solution.
            var t = -B / (2 * A);
            return {
                x: point1.x + t * dx,
                y: point1.y + t * dy,
                z: point1.z
            };
        }
        else
        {
            // Two solutions.
            var t1 = ((-B + Math.sqrt(det)) / (2 * A));
            if (t1 >= 0 && t1 <= 1) {
                return {x: point1.x + t1 * dx, y: point1.y + t1 * dy, z: point1.z};
            } else {
                var t2 = ((-B - Math.sqrt(det)) / (2 * A));
                return {x:point1.x + t2 * dx, y:point1.y + t2 * dy, z:point1.z};
            }
        }
    }

    function cropToCircle(cartesians, circleRadius)
    {
        var circleQ = circleRadius*circleRadius;
        var lastPointInsideCircle = -1;
        var lastPointOutsideCircle = -1;

        var quadrances = cartesians.map(function(loc) {
            return quadrance(loc);
        });

        for (var i = 0; i < cartesians.length; ++i) {
            var j = (i+1) % cartesians.length;

            if (lastPointInsideCircle < 0 && quadrances[i] <= circleQ && quadrances[j] > circleQ) {
                lastPointInsideCircle = i;
            }
            if (lastPointOutsideCircle < 0 && quadrances[i] > circleQ && quadrances[j] <= circleQ) {
                lastPointOutsideCircle = i;
            }
        }

        if (lastPointInsideCircle >= 0 && lastPointOutsideCircle >= 0) {
            var exitPoint = findLineCircleIntersections(
                circleRadius,
                cartesians[lastPointInsideCircle],
                cartesians[(lastPointInsideCircle+1)%cartesians.length]);
            var entryPoint = findLineCircleIntersections(
                circleRadius,
                cartesians[(lastPointOutsideCircle+1)%cartesians.length],
                cartesians[lastPointOutsideCircle]);

            if (exitPoint == null || entryPoint == null) {
                return cartesians;
            }

            var exitAngle = Math.atan2(exitPoint.y, exitPoint.x);
            var entryAngle = Math.atan2(entryPoint.y, entryPoint.x);
            if (exitAngle < entryAngle) {
                entryAngle -= Math.PI*2;
            }

            var points = [];
            points.push(entryPoint);
            var p = lastPointOutsideCircle;
            do {
                p = (p+1) % cartesians.length;
                points.push(cartesians[p]);
            } while(p != lastPointInsideCircle);
            points.push(exitPoint);

            // Now add points on the circle
            var step = 3*Math.PI/180;
            var a = exitAngle - step;
            while (a >= entryAngle) {
                points.push({
                    x: circleRadius * Math.cos(a),
                    y: circleRadius * Math.sin(a),
                    z: exitPoint.z
                });
                a -= step;
            }

            return points;
        }

        return cartesians;
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
            cartesians = cropToCircle(cartesians, t.radiusMetres);
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
            name: 'Prices',
            low: low,
            high: high,
            median: prices[Math.floor(prices.length/2)],
            format:function(value) { return "£" + value.toFixed(2); }
        }
    }

    function addVoronoiCellsAsLayer(pubs, map, layersControl, stats)
    {
        var layer = new leaflet.LayerGroup().addTo(map);
        pubs.forEach(function(pub) {
            L.polygon(pub.voronoiPolygon, {
                fillColor: colourDualLinear(pub.price, stats.low, stats.high, stats.median),
                stroke: false,
                fillOpacity: 0.5
            }).addTo(layer);
        });
        layersControl.addOverlay(layer, stats.name);
    }

    function initialiseMap()
    {
        setStatusMessage("Calculating...");

        var target = {
            lat:55.94816654144937,
            lon:-3.1994622945785522,
            radiusMetres:1609
        };
        var map = createMap(target.lat, target.lon);
        var layersControl = leaflet.control.layers(null, null, { "position":"bottomright", "collapsed": false }).addTo(map);

        addTargetToMap(target, map);
        var icons = createIcons();

        var todoPubs = filterByStatus(pubsData, [undefined]);
        addPubsAsLayer(todoPubs, "Todo (yellow)", icons.gold, layersControl).addTo(map);

        var donePubs = filterByStatus(pubsData, ["done"]);
        computeVoronoi(donePubs, target, 6378137);

        //var visitedPubs = filterByLink(donePubs, /^$/);
        //addPubsAsLayer(visitedPubs, "Visited (blue)", icons.blue, map, layersControl);

        var bloggedPubs = filterByLink(donePubs, /.+/);
        addPubsAsLayer(bloggedPubs, "Visited (green)", icons.green, layersControl).addTo(map);

        var excludedPubs = filterByStatus(pubsData, ["closed","disqualified"]);
        addPubsAsLayer(excludedPubs, "Excluded (red)", icons.red, layersControl);

        var stats = priceStats(donePubs);
        addVoronoiCellsAsLayer(donePubs, map, layersControl, stats);

        displayStats(stats);
        //setStatusMessage("Showing "+donePubs.length+" pubs");
    }

    initialiseMap();
});
