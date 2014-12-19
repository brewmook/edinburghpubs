require(['leaflet', '../../data/overpassData', '../../data/extraPubsData', '../../data/visitData'],
function (leaflet, overpassData, extraPubsData, visitDataArray) {

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
        var circle = new leaflet.circle([target.lat, target.lon],
            target.radiusMetres,
            {
                color: '#c80',
                fillColor: '#fc4',
                fillOpacity: 0.15
            });
        map.addLayer(circle);
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
            result[visitData[i][0]] = {"name":   visitData[i][1],
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

    function initialiseMap()
    {
        var target = { lat:55.94816654144937,
            lon:-3.1994622945785522,
            radiusMetres:1609 };
        var map = createMap(target.lat, target.lon);
        var layersControl = leaflet.control.layers(null, null, { "position":"bottomright", "collapsed": false }).addTo(map);

        addTargetToMap(target, map);
        var icons = createIcons();

        var allPubs = getPubs();

        var todoPubs = filterByStatus(allPubs, [undefined]);
        addPubsAsLayer(todoPubs, "Todo (yellow)", icons.gold, map, layersControl);

        var donePubs = filterByStatus(allPubs, ["done"]);

        var visitedPubs = filterByLink(donePubs, /^$/);
        addPubsAsLayer(visitedPubs, "Visited (green)", icons.green, map, layersControl);

        var bloggedPubs = filterByLink(donePubs, /.+/);
        addPubsAsLayer(bloggedPubs, "Blogged (blue)", icons.blue, map, layersControl);

        var excludedPubs = filterByStatus(allPubs, ["closed","disqualified"]);
        addPubsAsLayer(excludedPubs, "Excluded (red)", icons.red, map, layersControl);

        displayTotals(donePubs, todoPubs);
    }

    initialiseMap();
});
