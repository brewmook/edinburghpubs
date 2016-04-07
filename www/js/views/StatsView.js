define(['app/geometry', 'utility/Observable', 'leaflet'],
function (geometry, Observable, leaflet)
{
    function legendHtml(label, colour)
    {
        return '<br/><span style="background:' + colour.toString() + '"></span> ' + label;
    }

    /**
     * @constructor
     */
    function StatsView(map)
    {
        var legendDiv = leaflet.DomUtil.create('div', 'legend');
        var legend = leaflet.control({position: 'bottomright'});
        legend.onAdd = function(/*map*/) { return legendDiv; };
        legend.addTo(map);
        this._legendDiv = legendDiv;
    }

    /**
     * @param {StatsModel} statsModel
     */
    StatsView.prototype.setup = function(statsModel)
    {
        Observable.Combine(
            [statsModel.stat, statsModel.summary, statsModel.colourMap],
            function(stat, summary, colourMap) {
                if (!stat || !colourMap) return;

                var html = stat.label();
                if (summary) {
                    html += legendHtml(stat.formatValue(summary.minimum), colourMap.colour(summary.minimum));
                    html += legendHtml(stat.formatValue(summary.median),  colourMap.colour(summary.median));
                    html += legendHtml(stat.formatValue(summary.maximum), colourMap.colour(summary.maximum));
                }
                html += legendHtml("No data ", colourMap.colour(Number.MAX_VALUE));
                this._legendDiv.innerHTML = html;
            },
            this
        );
    };

    return StatsView;

});
