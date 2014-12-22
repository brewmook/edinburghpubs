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
        text += "<br/>{x:" + pub.x + ", y:"+pub.y+"}";
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

    function displayTotals(donePubs, todoPubs)
    {
        var done = donePubs.length;
        var total = done + todoPubs.length;
        var message = document.getElementById('message');
        message.innerHTML =
            "Total " + total + " pubs<br/>"
            + done + " done<br/>"
            + Math.round((done/total)*100)
            + "% complete";
    }

    function addTargetToMap(target, map)
    {
        var circle = new leaflet.circle(
            [target.lat, target.lon],
            target.radiusMetres,
            {
                color: '#c80',
                fillColor: '#fc4',
                fillOpacity: 0.15
            });
        map.addLayer(circle);
        map.addLayer(new leaflet.circle(
            [target.lat, target.lon],
            1.0,
            {
                color: '#f00',
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

    function getVisitData(visitData)
    {
        var result = {};
        for (var i in visitData)
        {
            result[visitData[i][0]] = {
                "name":   visitData[i][1],
                "status": visitData[i][2].split(":")[0],
                "statusinfo": visitData[i][2].split(":")[1],
                "link":   visitData[i][3]};
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
        return locations.forEach(function(loc) {
            var theta = (90 - loc.lat) * degToRad;
            var phi = (loc.lon - t.lon) * degToRad;

            // to 3d cartesian coordinates
            var x = r * Math.sin(theta) * Math.cos(phi);
            var y = r * Math.sin(theta) * Math.sin(phi);
            var z = r * Math.cos(theta);

            // rotate down to equator
            var rotation = t.lat * degToRad;
            var newZ = z * Math.cos(rotation) - x * Math.sin(rotation);
            var newX = z * Math.sin(rotation) + x * Math.cos(rotation);

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
        return locations.map(function(loc) {
            var newX = loc.z;
            var newZ = loc.y;
            var y = loc.x;

            // rotate back up to correct latitude
            var rotation = -t.lat * degToRad;
            var z = newZ * Math.cos(rotation) - newX * Math.sin(rotation);
            var x = newZ * Math.sin(rotation) + newX * Math.cos(rotation);

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
        var bbox = {xl:180, xr:-180, yt:90, yb:-90};

        calculateCartesian(locations, t, r);

        locations.forEach(function(loc)
        {
            bbox.xl = Math.min(loc.x, bbox.xl);
            bbox.xr = Math.max(loc.x, bbox.xr);
            bbox.yb = Math.max(loc.y, bbox.yb);
            bbox.yt = Math.min(loc.y, bbox.yt);
        });

        var halfWidth = (bbox.xr - bbox.xl) / 2.0;
        var halfHeight = (bbox.yb - bbox.yt) / 2.0;
        bbox.xl -= halfWidth;
        bbox.xr += halfWidth;
        bbox.yt -= halfHeight;
        bbox.yb += halfHeight;

        var voronoi = new Voronoi();
        var results = voronoi.compute(locations, bbox);

        results.cells.forEach(function(cell) {
            var pub = cell.site;
            var cartesians = cell.halfedges.map(function (edge) {
                var start = edge.getStartpoint();
                return {x:start.x, y:start.y, z:r};
            });
            pub.voronoiPolygon = cartesianToLatLng(cartesians, t, r);
            if (pub.voronoiPolygon.length > 0)
            {
                pub.voronoiPolygon.push(pub.voronoiPolygon[0]);
            }
        });
    }

    function addVoronoiCellsAsLayer(pubs, map, layersControl)
    {
        var layer = new leaflet.LayerGroup().addTo(map);
        pubs.forEach(function(pub) {
            L.polyline(pub.voronoiPolygon, {color: 'red'}).addTo(layer);
        });
        layersControl.addOverlay(layer, "Voronoi");
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

        addTargetToMap(target, map);
        var icons = createIcons();

        var allPubs = getPubs();

        var todoPubs = filterByStatus(allPubs, [undefined]);
        addPubsAsLayer(todoPubs, "Todo (yellow)", icons.gold, map, layersControl);

        var donePubs = filterByStatus(allPubs, ["done"]);
        computeVoronoi(donePubs, target, 6378137);

        var visitedPubs = filterByLink(donePubs, /^$/);
        addPubsAsLayer(visitedPubs, "Visited (green)", icons.green, map, layersControl);

        var bloggedPubs = filterByLink(donePubs, /.+/);
        addPubsAsLayer(bloggedPubs, "Blogged (blue)", icons.blue, map, layersControl);

        var excludedPubs = filterByStatus(allPubs, ["closed","disqualified"]);
        addPubsAsLayer(excludedPubs, "Excluded (red)", icons.red, map, layersControl);

        addVoronoiCellsAsLayer(donePubs, map, layersControl);

        displayTotals(donePubs, todoPubs);
    }

    initialiseMap();
});
