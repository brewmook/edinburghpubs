#!/usr/bin/env node
var fs = require('fs');

function formatVisit(pub) {
    var result = [];
    if ('date' in pub || 'price' in pub || 'link' in pub || 'comment' in pub) {
        result.push({
            date: pub.date || '',
            price: pub.price || 0,
            link: pub.link || '',
            comment: pub.comment || ''
        });
    }
    return result;
}

function formatPub(pub) {
    return {
        name: pub.name,
        opened: '',
        closed: '',
        tags: pub.tags || [],
        visits: formatVisit(pub)
    };
}

function stripRequireJSCode(text) {
    var firstNewline = text.indexOf('\n');
    var lastNewline = text.lastIndexOf('\n');
    return "[\n" + text.substr(firstNewline + 1, lastNewline - firstNewline) + "]";
}

function addRequireJSCode(text) {
    return 'define(function(){return' + text + ';});';
}

function reformatPub(pub) {
    var result = {
        lat: pub.lat,
        lon: pub.lon,
        history: [
            formatPub(pub)
        ]
    };
    if ("previous" in pub) {
        pub.previous.forEach(function(p){
            result.history.push(formatPub(p));
        });
    }
    return result;
}

var originalData = JSON.parse(stripRequireJSCode(fs.readFileSync('www/data/pubs.js', 'utf8')));
var newData = originalData.map(reformatPub);
var newFileContents = addRequireJSCode(JSON.stringify(newData, null, '\t'));

fs.writeFileSync('www/data/pubs.js', newFileContents);
