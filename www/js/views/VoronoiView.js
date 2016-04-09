define(['app/geometry', 'utility/Observable', 'leaflet'],
function (geometry, Observable, leaflet)
{
    // ---------------------------------------------------------------------------------------------
    // Private functions
    // ---------------------------------------------------------------------------------------------

    /**
     * @param {number[][]} points - Geographic coordinates, [lat, lon].
     * @param {Colour} colour
     * @param {leaflet.Layer} layer
     */
    function addPolygon(points, colour, layer)
    {
        leaflet.polygon(
            points,
            {
                fillColor: colour.toString(),
                stroke: false,
                fillOpacity: 0.5
            }
        ).addTo(layer).bringToBack();
    }

    // ---------------------------------------------------------------------------------------------
    // VoronoiView
    // ---------------------------------------------------------------------------------------------

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
        Observable.Combine(sitesModel.visibleSites, statsModel.stat, statsModel.colourMap)
            .buffer(50)
            .subscribe(function(sites, stat, colourMap) {
                this._layer.clearLayers();

                if (!stat || !sites || !colourMap) return;

                geometry.earthSurfaceVoronoi(
                    sites,
                    target.origin,
                    target.radius,
                    function(site, polygon) {
                        var value = stat.getValue(site);
                        addPolygon(polygon, colourMap.colour(value), this._layer);
                    }, this
                );
            }, this);
    };

    return VoronoiView;

});
