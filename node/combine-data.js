#!/usr/bin/env node
var fs = require('fs');
var overpassData = require('../data/overpassData.js');
var extraPubsData = require('../data/extraPubsData.js');
var visitDataArray = require('../data/visitData.js');
var tagsData = require('../data/tags.js');

function createVisit(visit)
{
    return {
        id:     visit[0],
        name:   visit[1],
        status: visit[2].split(":")[0],
        statusinfo: visit[2].split(":")[1],
        link:   visit[3],
        price:  visit[4]
    };
}

function getVisitData(visitData)
{
    var result = {};
    for (var i in visitData)
    {
        var visit = createVisit(visitData[i]);
        if (visit.id in result) {
            result[visit.id].push(visit);
        } else {
            result[visit.id] = [visit];
        }
    }
    return result;
}

function mergeData(visitData, tags, pub)
{
    if (pub.id in visitData)
    {
        var visits = visitData[pub.id];
        if (visits.length > 1) {
            pub.previous = [];
            for (var i = 0; i < visits.length-1; ++i) {
                pub.previous.push(visits[i]);
            }
        }
        var lastVisit = visits[visits.length-1];
        if (pub.name != lastVisit.name) {
            if (!("previous" in pub)) pub.previous = [];
            pub.previous.push(lastVisit);
        } else {
            pub.status = lastVisit.status;
            pub.statusinfo = lastVisit.statusinfo;
            pub.link = lastVisit.link;
            pub.price = lastVisit.price;
        }
        if (pub.link in tags) {
            pub.tags = tags[pub.link];
        } else {
            pub.tags = [];
        }
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
        var pub = mergeData(visitData, tagsData, allPubs[i]);
        dictionary[pub.id] = pub;
    }

    return dictionaryToArray(dictionary);
}

var pubs = getPubs();
fs.writeFileSync('www/data/pubs.js', 'define(function(){return' + JSON.stringify(pubs, null, '\t') + ';});');
