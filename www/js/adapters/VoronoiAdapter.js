define(['app/Colour', 'app/ColourMap', 'app/geometry', 'app/Observable', 'views/VoronoiView'],
function (Colour, ColourMap, geometry, Observable, VoronoiView) {

    /**
     * @param {ColourMap} colourMap
     * @param {StatsModel.Summary} summary
     */
    function setColours(colourMap, summary)
    {
        colourMap.clear();
        if (summary) {
            colourMap.addColour(summary.minimum, new Colour(0,255,0));
            colourMap.addColour(summary.median, new Colour(0,0,255));
            colourMap.addColour(summary.maximum, new Colour(255,0,0));
        }
    }

    /**
     * @param {SitesModel} sitesModel
     * @param {StatsModel} statsModel
     * @param {VoronoiView} view
     * @param {Target} target
     * @constructor
     */
    function VoronoiAdapter(sitesModel, statsModel, view, target)
    {
        var colourMap = new ColourMap();
        colourMap.setOutOfRangeColour(new Colour(64,64,64));

        Observable.Combine([statsModel.stat, statsModel.summary], function(stat, summary) {
            if (!stat) return;

            setColours(colourMap, summary);

            var legendEntries = [];
            if (summary) {
                legendEntries.push(new VoronoiView.LegendEntry(stat.formatValue(summary.minimum), colourMap.colour(summary.minimum)));
                legendEntries.push(new VoronoiView.LegendEntry(stat.formatValue(summary.median), colourMap.colour(summary.median)));
                legendEntries.push(new VoronoiView.LegendEntry(stat.formatValue(summary.maximum), colourMap.colour(summary.maximum)));
            }
            legendEntries.push(new VoronoiView.LegendEntry("No data ", colourMap.colour(Number.MAX_VALUE)));
            view.setLegend(stat.label(), legendEntries);
        });

        Observable.Combine([sitesModel.sites, statsModel.stat], function(sites, stat) {
            view.clearPolygons();

            if (!stat || !sites) return;

            geometry.earthSurfaceVoronoi(
                sites,
                target.origin,
                target.radius,
                function(site, polygon) {
                    var value = stat.getValue(site);
                    view.addPolygon(polygon, colourMap.colour(value));
                }
            );
        });
    }

    return VoronoiAdapter;
});
