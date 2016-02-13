define(['leaflet'], function (leaflet)
{
    /**
     * @constructor
     */
    function VoronoiView(map)
    {
        this._layer = leaflet.layerGroup().addTo(map);

        var legendDiv = leaflet.DomUtil.create('div', 'legend');
        var legend = leaflet.control({position: 'bottomright'});
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
