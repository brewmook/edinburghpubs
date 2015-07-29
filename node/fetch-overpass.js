#!/usr/bin/env node
var http = require('http');
var request = require('request');

function interpolate(low, high)
{
    return low + ((high-low)/2.0);
}

function calcCentroid(way, nodes)
{
    var node = nodes[way.nodes[0]];
    var latLow = node.lat;
    var lonLow = node.lon;
    var latHigh = node.lat;
    var lonHigh = node.lon;

    way.nodes.forEach(function(nodeIndex) {
        node = nodes[nodeIndex];
        latLow = Math.min(latLow, node.lat);
        lonLow = Math.min(lonLow, node.lon);
        latHigh = Math.max(latHigh, node.lat);
        lonHigh = Math.max(lonHigh, node.lon);
    });

    return {lat:interpolate(latLow,latHigh), lon:interpolate(lonLow, lonHigh)};
}

function relevant(amenitiesRE, tags)
{
    return tags && tags.name && amenitiesRE.test(tags.amenity);
}

function parseResults(amenitiesRE, data)
{
    var areaNodes = {};
    var results = [];

    data.elements.forEach(function(el) {
        if (el.type == "node") {
            if (el.lat && el.lon && relevant(amenitiesRE, el.tags)) {
                results.push({name:el.tags.name, id:el.id, lat:el.lat, lon:el.lon});
            }
            else {
                areaNodes[el.id] = el;
            }
        }
        else {
            var loc = calcCentroid(el, areaNodes);
            if (loc && relevant(amenitiesRE, el.tags)) {
                results.push({name:el.tags.name, id:el.id, lat:loc.lat, lon:loc.lon});
            }
        }
    });

    results.sort(function (a, b) {
        if (a.name > b.name) { return 1; }
        if (a.name < b.name) { return -1; }
        return 0;
    });

    return results;
}

function buildOverpassQueryUrl(lat, lon, radiusMetres, amenitiesRE)
{
    var url = "http://overpass-api.de/api/interpreter?data=";
    var around = [radiusMetres, lat, lon].join(',');
    var amenities = amenitiesRE.toString();
    amenities = amenities.substring(1, amenities.length-1);

    var overpassQuery = "[out:json];\
      (\
        node(around:"+around+")[\"amenity\"~\""+amenities+"\"];\
        way(around:"+around+")[\"amenity\"~\""+amenities+"\"];\
      );\
      (._;>;);\
      out body;";

    return url + encodeURIComponent(overpassQuery);
}

function findAmenities(lat, lon, radiusMetres, amenitiesRE, success)
{
    var url = buildOverpassQueryUrl(lat, lon, radiusMetres, amenitiesRE);
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var amenities = parseResults(amenitiesRE, JSON.parse(body));
            success(amenities);
        }
    });
}

function writeJSON(amenities)
{
    console.log('module.exports = [');
    amenities.forEach(function(a) { return console.log(JSON.stringify(a) + ','); });
    console.log('];');
}

findAmenities(55.94816654144937, -3.1994622945785522, 1615, /^(pub|bar)$/, writeJSON);
