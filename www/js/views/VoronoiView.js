define(['leaflet'], function (leaflet)
{
    /**
     * @constructor
     */
    function VoronoiView(map)
    {
        this._layer = leaflet.layerGroup().addTo(map);
    }

    /**
     * @param {VoronoiView.Polygon[]} polygons
     */
    VoronoiView.prototype.setPolygons = function(polygons)
    {
        this._layer.clearLayers();

        var voronoiLayer = this._layer;
        polygons.forEach(function(polygon) {
            leaflet.polygon(
                polygon.points.map(function(coord) { return leaflet.latLng([coord.lat, coord.lon]); }),
                {
                    fillColor: polygon.colour.toString(),
                    stroke: false,
                    fillOpacity: 0.5
                }
            ).addTo(voronoiLayer);
        });
    };

    /**
     * @param {GeoCoord[]} points
     * @param {Colour} colour
     * @constructor
     */
    VoronoiView.Polygon = function(points, colour)
    {
        this.points = points;
        this.colour = colour;
    };

    return VoronoiView;

});
