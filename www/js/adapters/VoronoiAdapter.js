define(['app/Colour', 'app/ColourMap', 'app/geometry', 'views/VoronoiView'],
function (Colour, ColourMap, geometry, VoronoiView) {

    function setColours(colourMap, stats)
    {
        colourMap.clear();
        colourMap.addColour(stats.minimum, new Colour(0,255,0));
        colourMap.addColour(stats.median, new Colour(0,0,255));
        colourMap.addColour(stats.maximum, new Colour(255,0,0));
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

            view.setLegend(
                stat.label(),
                [new VoronoiView.LegendEntry(stat.formatValue(stats.minimum), colourMap.colour(stats.minimum)),
                 new VoronoiView.LegendEntry(stat.formatValue(stats.median) + " (median)", colourMap.colour(stats.median)),
                 new VoronoiView.LegendEntry(stat.formatValue(stats.maximum), colourMap.colour(stats.maximum)),
                 new VoronoiView.LegendEntry("No data ", colourMap.colour(stats.maximum+1))]
            );

            var voronoi = geometry.earthSurfaceVoronoi(sitesModel.sites.get(), target.origin, target.radius);
            var polygons = voronoi.map(function(cell) {
                var value = stat.getValue(cell.loc);
                return new VoronoiView.Polygon(cell.polygon, colourMap.colour(value));
            });
            view.setPolygons(polygons);
        });
    }

    return VoronoiAdapter;
});
