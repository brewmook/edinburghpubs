define(['app/geometry', 'utility/Observable', 'leaflet'],
function (geometry, Observable, leaflet)
{
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

                var legendEntries = [];
                if (summary) {
                    legendEntries.push(new StatsView.LegendEntry(stat.formatValue(summary.minimum), colourMap.colour(summary.minimum)));
                    legendEntries.push(new StatsView.LegendEntry(stat.formatValue(summary.median), colourMap.colour(summary.median)));
                    legendEntries.push(new StatsView.LegendEntry(stat.formatValue(summary.maximum), colourMap.colour(summary.maximum)));
                }
                legendEntries.push(new StatsView.LegendEntry("No data ", colourMap.colour(Number.MAX_VALUE)));
                this.setLegend(stat.label(), legendEntries);
            }, this
        );
    };

    /**
     * @param {string} label
     * @param {StatsView.LegendEntry[]} entries
     */
    StatsView.prototype.setLegend = function(label, entries)
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
     * @param {string} label
     * @param {Colour} colour
     * @constructor
     */
    StatsView.LegendEntry = function(label, colour)
    {
        this.label = label;
        this.colour = colour;
    };

    return StatsView;

});
