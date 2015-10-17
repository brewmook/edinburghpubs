#!/usr/bin/env node
var fs = require('fs');

function stripRequireJSCode(text) {
    var firstNewline = text.indexOf('\n');
    var lastNewline = text.lastIndexOf('\n');
    return "[\n" + text.substr(firstNewline + 1, lastNewline - firstNewline) + "]";
}

function addRequireJSCode(text) {
    return 'define(function(){return' + text + ';});';
}

var originalData = JSON.parse(stripRequireJSCode(fs.readFileSync('www/data/pubs.js', 'utf8')));
var newData = {
    target: {
        origin: {
            lat: 55.94816654144937,
            lon: -3.1994622945785522
        },
        radius: 1609
    },
    sites: originalData
};
var newFileContents = addRequireJSCode(JSON.stringify(newData, null, '\t'));

fs.writeFileSync('www/data/pubs.js', newFileContents);
