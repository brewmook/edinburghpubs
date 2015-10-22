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
     * @param {{points:GeoCoord[],colour:Colour}[]} polygons
     */
    VoronoiView.prototype.setPolygons = function(polygons)
    {
        this._layer.clearLayers();

        var voronoiLayer = this._layer;
        polygons.forEach(function(polygon) {
            leaflet.polygon(
                polygon.points.map(function(coord) { return leaflet.latLng([coord.lat, coord.lon]); }),
                {
                    fillColor: polygon.colour,
                    stroke: false,
                    fillOpacity: 0.5
                }
            ).addTo(voronoiLayer);
        });
    };

    return VoronoiView;

});
