define(['app/geometry', 'views/VoronoiView'],
function (geometry, VoronoiView) {

    /**
     * @param {SitesModel} sitesModel
     * @param {VoronoiView} view
     * @param {Target} target
     * @constructor
     */
    function VoronoiAdapter(sitesModel, view, target)
    {
        this._view = view;
        this._target = target;
        this.colourCallback = function(site) { return 0; };

        var me = this;
        sitesModel.sites.subscribe(function(sites) { me._onSitesChanged(sites); });
    }

    VoronoiAdapter.prototype._onSitesChanged = function(sites)
    {
        var colourCallback = this.colourCallback;
        var voronoi = geometry.earthSurfaceVoronoi(sites, this._target.origin, this._target.radius);
        var polygons = voronoi.map(function(cell) {
            return new VoronoiView.Polygon(cell.polygon, colourCallback(cell.loc));
        });
        this._view.setPolygons(polygons);
    };

    return VoronoiAdapter;
});
