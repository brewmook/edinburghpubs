#!/usr/bin/env node
var fs = require('fs');

function stripRequireJSCode(text) {
    var firstNewline = text.indexOf('\n');
    var lastNewline = text.lastIndexOf('\n');
    return "{\n" + text.substr(firstNewline + 1, lastNewline - firstNewline) + "}";
}

function addRequireJSCode(text) {
    return 'define(function(){return' + text + ';});';
}

var originalData = JSON.parse(stripRequireJSCode(fs.readFileSync('www/data/pubs.js', 'utf8')));
var newData = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [
                    originalData.target.origin.lat,
                    originalData.target.origin.lon
                ]
            },
            properties: {
                type: "Target",
                radius: originalData.target.radius
            }
        }
    ].concat(originalData.sites)
};
var newFileContents = addRequireJSCode(JSON.stringify(newData, null, '\t'));

fs.writeFileSync('www/data/pubs.js', newFileContents);
