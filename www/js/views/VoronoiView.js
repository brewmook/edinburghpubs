define(['app/geometry', 'utility/Observable', 'leaflet'],
function (geometry, Observable, leaflet)
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
     * @param {SitesModel} sitesModel
     * @param {StatsModel} statsModel
     * @param {Target} target
     */
    VoronoiView.prototype.setup = function(sitesModel, statsModel, target)
    {
        Observable.Combine(
            [statsModel.stat, statsModel.summary, statsModel.colourMap],
            function(stat, summary, colourMap) {
                if (!stat || !colourMap) return;

                var legendEntries = [];
                if (summary) {
                    legendEntries.push(new VoronoiView.LegendEntry(stat.formatValue(summary.minimum), colourMap.colour(summary.minimum)));
                    legendEntries.push(new VoronoiView.LegendEntry(stat.formatValue(summary.median), colourMap.colour(summary.median)));
                    legendEntries.push(new VoronoiView.LegendEntry(stat.formatValue(summary.maximum), colourMap.colour(summary.maximum)));
                }
                legendEntries.push(new VoronoiView.LegendEntry("No data ", colourMap.colour(Number.MAX_VALUE)));
                this.setLegend(stat.label(), legendEntries);
            }, this
        );

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
