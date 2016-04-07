define(['app/geometry', 'utility/Observable', 'views/VoronoiView'],
function (geometry, Observable, VoronoiView) {

    /**
     * @param {SitesModel} sitesModel
     * @param {StatsModel} statsModel
     * @param {VoronoiView} view
     * @param {Target} target
     * @constructor
     */
    function VoronoiAdapter(sitesModel, statsModel, view, target)
    {
        Observable.Combine(
            [statsModel.stat, statsModel.summary, statsModel.colourMap],
            function(stat, summary, colourMap) {
                if (!stat || !colourMap) return;

                var legendEntries = [];
                if (summary) {
                    legendEntries.push(new VoronoiView.LegendEntry(stat.formatValue(summary.minimum), colourMap.colour(summary.minimum)));
                    legendEntries.push(new VoronoiView.LegendEntry(stat.formatValue(summary.median), colourMap.colour(summary.median)));
                    legendEntries.push(new VoronoiView.LegendEntry(stat.formatValue(summary.maximum), colourMap.colour(summary.maximum)));
                }
                legendEntries.push(new VoronoiView.LegendEntry("No data ", colourMap.colour(Number.MAX_VALUE)));
                view.setLegend(stat.label(), legendEntries);
        });

        Observable.Combine(
            [sitesModel.visibleSites, statsModel.stat, statsModel.colourMap],
            function(sites, stat, colourMap) {
                view.clearPolygons();

                if (!stat || !sites || !colourMap) return;

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
