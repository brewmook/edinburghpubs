#!/usr/bin/env node
var fs = require('fs');
var overpassData = require('../data/overpassData.js');
var extraPubsData = require('../data/extraPubsData.js');
var visitDataArray = require('../data/visitData.js');

function getVisitData(visitData)
{
    var result = {};
    for (var i in visitData)
    {
        result[visitData[i][0]] = {
            "name":   visitData[i][1],
            "status": visitData[i][2].split(":")[0],
            "statusinfo": visitData[i][2].split(":")[1],
            "link":   visitData[i][3],
            "price":  visitData[i][4]
        };
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
        pub.price = visitData[pub.id].price;
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

var pubs = getPubs();
fs.writeFileSync('www/data/pubs.js', 'define(function(){return' + JSON.stringify(pubs, null, '\t') + ';});');
