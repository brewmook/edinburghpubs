define(['leaflet'], function (leaflet)
{
    /**
     * @constructor
     */
    function VoronoiView(map)
    {
        this._layer = leaflet.layerGroup().addTo(map);

        var legendDiv = leaflet.DomUtil.create('div', 'legend');
        var legend = leaflet.control({position: 'topright'});
        legend.onAdd = function(map) { return legendDiv; };
        legend.addTo(map);
        this._legendDiv = legendDiv;
    }

    /**
     * @param {string} label
     * @param {VoronoiView.LegendEntry[]} entries
     */
    VoronoiView.prototype.setLegend = function(label, entries)
    {
        var items = [label];
        entries.forEach(function(entry) {
            items.push(
                '<span style="background:' + entry.colour.toString() + '"></span> '
                + entry.label
            );
        });
        this._legendDiv.innerHTML = items.join('<br/>');
    };

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
            ).addTo(voronoiLayer).bringToBack();
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

    /**
     * @param {string} label
     * @param {Colour} colour
     * @constructor
     */
    VoronoiView.LegendEntry = function(label, colour)
    {
        this.label = label;
        this.colour = colour;
    };

    return VoronoiView;

});
