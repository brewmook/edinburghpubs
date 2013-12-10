#!/usr/bin/env node
var fs = require('fs');
var http = require('http');
var request = require('request');

var overpassTemplate = "\
    [out:json];\
    (\
      node(around:{rad},{lat},{lon})[\"amenity\"~\"{amenities}\"];\
      way(around:{rad},{lat},{lon})[\"amenity\"~\"{amenities}\"];\
    );\
    (._;>;);\
    out body;";

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
        if (el.type == "node")
        {
            if (el.lat && el.lon && relevant(amenitiesRE, el.tags))
            {
                results.push({id:el.id, lat:el.lat, lon:el.lon, name:el.tags.name});
            }
            else
            {
                areaNodes[el.id] = el;
            }
        }
        else
        {
            var loc = calcCentroid(el, areaNodes);
            if (loc && relevant(amenitiesRE, el.tags))
            {
                results.push({id:el.id, lat:loc.lat, lon:loc.lon, name:el.tags.name});
            }
        }
    });

    return results;
}

function overpassQueryUrl(target, queryTemplate, amenitiesRE)
{
    var amenities = amenitiesRE.toString();
    var url = "http://overpass-api.de/api/interpreter?data=";
    var query = queryTemplate;
    query = query.replace(/\{rad\}/g, target.radiusMetres);
    query = query.replace(/\{lat\}/g, target.lat);
    query = query.replace(/\{lon\}/g, target.lon);
    query = query.replace(/\{amenities\}/g, amenities.substring(1, amenities.length-1));
    return url + encodeURIComponent(query);
}

function csvify(pubs)
{
    var result = [];
    pubs.forEach(function(pub) {
	result.push([pub.id, pub.name, pub.lat, pub.lon].join(', '));
    });
    return result.join('\n');
}

function jsonify(pubs)
{
//    var result = {}
//    pubs.forEach(function(pub) {
//	result[pub.id] = {"name":pub.name,
//			  "lat":pub.lat,
//			  "lon":pub.lon};
//    });
//    return JSON.stringify(result);
    return "var overpassData = " + JSON.stringify(pubs);
}

function findPubs(target, amenitiesRE)
{
    request(overpassQueryUrl(target, overpassTemplate, amenitiesRE),
            function (error, response, body) {
		if (!error && response.statusCode == 200) {
		    var pubs = parseResults(amenitiesRE, JSON.parse(body));
                    fs.writeFileSync('www/data/overpassData.csv', csvify(pubs));
                    fs.writeFileSync('www/data/overpassData.js', jsonify(pubs));
		}
	    });
}

var target = { lat:55.94816654144937,
	       lon:-3.1994622945785522,
	       radiusMetres:1609 };
var amenities = /^(pub|bar)$/;

findPubs(target, amenities);
