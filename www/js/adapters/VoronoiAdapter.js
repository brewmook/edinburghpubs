define(['app/geometry', 'models/StatsModel', 'views/VoronoiView'],
function (geometry, StatsModel, VoronoiView) {

    /**
     * @param {SitesModel} sitesModel
     * @param {StatsModel} statsModel
     * @param {VoronoiView} view
     * @param {Target} target
     * @constructor
     */
    function VoronoiAdapter(sitesModel, statsModel, view, target)
    {
        this._view = view;
        this._target = target;
        this._statsModel = statsModel;

        var me = this;
        sitesModel.sites.subscribe(function(sites) { me._onSitesChanged(sites); });
        statsModel.stat.subscribe(function(_) { me._onSitesChanged(sitesModel.sites.get()); })
    }

    VoronoiAdapter.prototype._onSitesChanged = function(sites)
    {
        var statsModel = this._statsModel;
        var voronoi = geometry.earthSurfaceVoronoi(sites, this._target.origin, this._target.radius);
        var polygons = voronoi.map(function(cell) {
            return new VoronoiView.Polygon(cell.polygon, statsModel.getColour(cell.loc));
        });
        this._view.setPolygons(polygons);
    };

    return VoronoiAdapter;
});
