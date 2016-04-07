define(['app/geometry', 'utility/Observable', 'leaflet'],
function (geometry, Observable, leaflet)
{
    /**
     * @constructor
     */
    function VoronoiView(map)
    {
        this._layer = leaflet.layerGroup().addTo(map);
    }

    /**
     * @param {SitesModel} sitesModel
     * @param {StatsModel} statsModel
     * @param {Target} target
     */
    VoronoiView.prototype.setup = function(sitesModel, statsModel, target)
    {
        Observable.Combine(
            [sitesModel.visibleSites, statsModel.stat, statsModel.colourMap],
            function(sites, stat, colourMap) {
                this.clearPolygons();

                if (!stat || !sites || !colourMap) return;

                geometry.earthSurfaceVoronoi(
                    sites,
                    target.origin,
                    target.radius,
                    function(site, polygon) {
                        var value = stat.getValue(site);
                        this.addPolygon(polygon, colourMap.colour(value));
                    },
                    this
                );
            },
            this
        );
    };

    VoronoiView.prototype.clearPolygons = function()
    {
        this._layer.clearLayers();
    };

    /**
     * @param {number[][]} points - Geographic coordinates, [lat, lon].
     * @param {Colour} colour
     */
    VoronoiView.prototype.addPolygon = function(points, colour)
    {
        leaflet.polygon(
            points,
            {
                fillColor: colour.toString(),
                stroke: false,
                fillOpacity: 0.5
            }
        ).addTo(this._layer).bringToBack();
    };

    return VoronoiView;

});
