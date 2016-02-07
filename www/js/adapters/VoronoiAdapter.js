define(['app/Colour', 'app/ColourMap', 'app/geometry', 'views/VoronoiView'],
function (Colour, ColourMap, geometry, VoronoiView) {

    function setColours(colourMap, stats)
    {
        colourMap.clear();
        if (stats) {
            colourMap.addColour(stats.minimum, new Colour(0,255,0));
            colourMap.addColour(stats.median, new Colour(0,0,255));
            colourMap.addColour(stats.maximum, new Colour(255,0,0));
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
        setColours(colourMap, statsModel.stats.get());

        statsModel.stats.subscribe(function(stats) {
            setColours(colourMap, stats);

            var stat = statsModel.stat.get();

            var legendEntries = [];
            if (stats) {
                legendEntries.push(new VoronoiView.LegendEntry(stat.formatValue(stats.minimum), colourMap.colour(stats.minimum)));
                legendEntries.push(new VoronoiView.LegendEntry(stat.formatValue(stats.median), colourMap.colour(stats.median)));
                legendEntries.push(new VoronoiView.LegendEntry(stat.formatValue(stats.maximum), colourMap.colour(stats.maximum)));
            }
            legendEntries.push(new VoronoiView.LegendEntry("No data ", colourMap.colour(Number.MAX_VALUE)));
            view.setLegend(stat.label(), legendEntries);
            view.clearPolygons();

            geometry.earthSurfaceVoronoi(
                sitesModel.sites.get(),
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
