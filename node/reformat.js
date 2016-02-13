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
    target: originalData.target,
    sites: originalData.sites.map(function(site){
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [site.lat, site.lon]
            },
            properties: site.properties
        };
    })
};
var newFileContents = addRequireJSCode(JSON.stringify(newData, null, '\t'));

fs.writeFileSync('www/data/pubs.js', newFileContents);
