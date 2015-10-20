define(['app/ObservableSet', 'app/ObservableValue', 'leaflet'],
function (ObservableSet, ObservableValue, leaflet) {

    /**
     * @param {string} elementId - the id of the HTML element to use as the map.
     * @constructor
     */
    function View(elementId)
    {
        this._map = leaflet.map(elementId);

        this._layersControl = leaflet.control.layers(null, null, {position: "bottomright", collapsed: false});
        this._layersControl.addTo(this._map);

        // Open Street Map attribution
        var osmAttr = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
        leaflet.tileLayer(
            'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
            { attribution: osmAttr }
        ).addTo(this._map);

        this._targetAreaLayer = leaflet.layerGroup().addTo(this._map);
        this._voronoiLayer = leaflet.layerGroup().addTo(this._map);
        this._groupLayers = [];

        var visibleGroups = new ObservableSet();
        this._map.on('overlayadd', function(e) { visibleGroups.add(e.layer.viewGroupId); });
        this._map.on('overlayremove', function(e) { visibleGroups.remove(e.layer.viewGroupId); });
        this.visibleGroups = visibleGroups;

        var filterText = new ObservableValue('');
        var filter = document.getElementById('filter');
        filter.addEventListener("change", function(e) {
            filterText.set(filter.value);
        });
        this.filterText = filterText;
    }

    /**
     * Set up the target.
     *
     * @param {GeoCoord} origin - The map origin.
     * @param {number} circleRadius - The circle radius in metres for target area.
     * @constructor
     */
    View.prototype.setTarget = function(origin, circleRadius)
    {
        this._map.setView(leaflet.latLng([origin.lat, origin.lon]), 13);

        this._targetAreaLayer.clearLayers();

        // Add the target area circle
        this._targetAreaLayer.addLayer(leaflet.circle(
            origin,
            circleRadius,
            {
                color: '#c80',
                opacity: 1,
                fill: false
            }
        ));

        // Add a spot right in the middle
        this._targetAreaLayer.addLayer(leaflet.circle(
            origin,
            1.0,
            {
                color: '#f00',
                opacity: 1,
                fillColor: '#f00',
                fillOpacity: 1
            }
        ));
    };

    View.prototype._clearSites = function()
    {
        this.visibleGroups.set([]);

        var map = this._map;
        var control = this._layersControl;
        this._groupLayers.forEach(function(layer) {
            control.removeLayer(layer);
            map.removeLayer(layer);
        });
        this._groupLayers = [];
    };

    /**
     * @param {{id:string, label:string, icon:string, visible:bool, sites:SiteViewModel[]}[]} groups
     */
    View.prototype.setSites = function(groups)
    {
        this.visibleGroups.setNotifyEnabled(false);
        this._clearSites();

        var layersControl = this._layersControl;
        var groupLayers = this._groupLayers;
        var map = this._map;

        groups.forEach(function(group) {

            var layer = leaflet.layerGroup();
            layer.viewGroupId = group.id;

            var icon = leaflet.icon({
                iconUrl: "img/marker-" + group.icon + ".png",
                iconRetinaUrl: "img/marker-" + group.icon + "-2x.png",
                iconSize: [25, 39],
                iconAnchor: [12, 36],
                popupAnchor: [0, -30]
            });

            layersControl.addOverlay(layer, group.label + " (" + group.icon + ")");
            groupLayers.push(layer);

            if (group.visible) {
                layer.addTo(map);
            }

            group.sites.forEach(function(site) {
                var location = leaflet.latLng([site.lat, site.lon]);
                var marker = leaflet.marker(location, {"title": site.label, "icon": icon});
                marker.addTo(layer);
                marker.bindPopup(site.html);
            });
        });

        this.visibleGroups.setNotifyEnabled(true);
        this.visibleGroups.notify();
    };

    /**
     * @param {{points:GeoCoord[],colour:Colour}[]} polygons
     */
    View.prototype.setVoronoiPolygons = function(polygons)
    {
        this._voronoiLayer.clearLayers();

        var voronoiLayer = this._voronoiLayer;
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

    /**
     * @param {string} html
     */
    View.prototype.setStatusMessage = function(html)
    {
        document.getElementById('message').innerHTML = html;
    };

    /**
     * @param {string[]} tags
     */
    View.prototype.setTags = function(tags)
    {
        var datalist = document.getElementById('tags');
        while (datalist.firstChild) {
            datalist.removeChild(datalist.firstChild);
        }
        tags.forEach(function(tag) {
            var child = document.createElement('option');
            //child.setAttribute('value', tag);
            child.value = tag;
            datalist.appendChild(child);
        });
    };

    return View;

});
