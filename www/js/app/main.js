define(['leaflet', 'voronoi', 'data/pubs'],
function (leaflet, Voronoi, pubsData) {

    function createMap(latitude, longitude, radiusMetres)
    {
        var location = [latitude, longitude];

        // The map itself
        var map = leaflet.map('map').setView(location, 13);

        // Open Street Map attribution
        var osmAttr = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
        leaflet.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
            attribution: osmAttr
        }).addTo(map);

        // Add the target area circle
        var layer = new leaflet.LayerGroup().addTo(map);
        var circle = new leaflet.circle(
            location,
            radiusMetres,
            {
                color: '#c80',
                opacity: 1,
                fill: false
            });
        layer.addLayer(circle);

        // Add a spot right in the middle
        layer.addLayer(new leaflet.circle(
            location,
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

    function calculateCartesians(locations, latitude, longitude, sphereRadiusMetres)
    {
        var degToRad = Math.PI/180.0;
        var rotation = latitude * degToRad;
        var cosRotation = Math.cos(rotation);
        var sinRotation = Math.sin(rotation);

        return locations.map(function(loc) {
            var theta = (90 - loc.lat) * degToRad;
            var phi = (loc.lon - longitude) * degToRad;

            // to 3d cartesian coordinates
            var sinTheta = Math.sin(theta);
            var x = sphereRadiusMetres * sinTheta * Math.cos(phi);
            var y = sphereRadiusMetres * sinTheta * Math.sin(phi);
            var z = sphereRadiusMetres * Math.cos(theta);

            // rotate down to equator
            var newZ = z * cosRotation - x * sinRotation;
            var newX = z * sinRotation + x * cosRotation;

            // project onto new xy orientation
            return {
                loc: loc,
                x: y,
                y: -newZ,
                z: newX
            };
        });
    }

    function cartesianToLatLng(locations, latitude, longitude, sphereRadius)
    {
        var degToRad = Math.PI/180.0;
        var radToDeg = 180.0/Math.PI;
        var rotation = -latitude * degToRad;
        var cosRotation = Math.cos(rotation);
        var sinRotation = Math.sin(rotation);

        return locations.map(function(loc) {
            var rotatedX = loc.z;
            var rotatedZ = -loc.y;
            var y = loc.x;

            // unrotate back up to correct latitude
            var z = rotatedZ * cosRotation - rotatedX * sinRotation;
            var x = rotatedZ * sinRotation + rotatedX * cosRotation;

            var theta = Math.acos(z/sphereRadius) * radToDeg;
            var phi = Math.atan(y/x) * radToDeg;

            return {
                lat: 90.0 - theta,
                lng: phi + longitude
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

    function squareBoundingBox(size)
    {
        var halfSize = size/2;
        return {
            xl: -halfSize,
            xr: halfSize,
            yt: -halfSize,
            yb: halfSize
        };
    }

    function computeVoronoi(locations, latitude, longitude, circleRadiusMetres, sphereRadiusMetres)
    {
        var voronoi = new Voronoi();
        var computed = voronoi.compute(
            calculateCartesians(locations, latitude, longitude, sphereRadiusMetres),
            squareBoundingBox(2*circleRadiusMetres+100)
        );

        return computed.cells.map(function(cell) {
            var polygon = cell.halfedges.map(function (edge) {
                var start = edge.getStartpoint();
                return {x:start.x, y:start.y, z:sphereRadiusMetres};
            });
            var croppedPolygon = cropToCircle(polygon, circleRadiusMetres);
            return {
                loc: cell.site.loc,
                polygon: cartesianToLatLng(croppedPolygon, latitude, longitude, sphereRadiusMetres)
            }
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
            L.polygon(site.polygon, {
                fillColor: colourDualLinear(site.colour, stats.low, stats.high, stats.median),
                stroke: false,
                fillOpacity: 0.5
            }).addTo(layer);
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

        var target = {
            lat:55.94816654144937,
            lon:-3.1994622945785522,
            radiusMetres:1609
        };
        var map = createMap(target.lat, target.lon, target.radiusMetres);
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

        var earthRadiusMetres = 6378137;
        var sites = computeVoronoi(bloggedPubs, target.lat, target.lon, target.radiusMetres, earthRadiusMetres);
        addVoronoiCellsAsLayer(
            sites.map(function(site) { return { polygon: site.polygon, colour: site.loc.price }; }),
            map,
            layersControl,
            stats
        );
    }

    initialiseMap();
});
