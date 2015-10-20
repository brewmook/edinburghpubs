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
        this._map.on('overlayadd', function(e) { visibleGroups.add(e.layer.viewGroupName); });
        this._map.on('overlayremove', function(e) { visibleGroups.remove(e.layer.viewGroupName); });
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

    View.prototype.clearSites = function()
    {
        var map = this._map;
        var control = this._layersControl;
        this._groupLayers.forEach(function(layer) {
            control.removeLayer(layer);
            map.removeLayer(layer);
        });
        this._groupLayers = [];
    };

    /**
     * @param sites
     * @param {Object.<string,{label:string, icon:string, visible:bool}>} groups
     */
    View.prototype.setGroupedSites = function(sites, groups)
    {
        this.clearSites();

        var layers = {};
        for (var group in groups) {
            if (groups.hasOwnProperty(group)) {
                layers[group] = {
                    layer: leaflet.layerGroup(),
                    icon: leaflet.icon({
                        iconUrl: "img/marker-" + groups[group].icon + ".png",
                        iconRetinaUrl: "img/marker-" + groups[group].icon + "-2x.png",
                        iconSize: [25, 39],
                        iconAnchor: [12, 36],
                        popupAnchor: [0, -30]
                    })
                };

                layers[group].layer.viewGroupName = group;

                this._groupLayers.push(layers[group].layer);

                this._layersControl.addOverlay(
                    layers[group].layer,
                    groups[group].label + " (" + groups[group].icon + ")"
                );

                if (groups[group].visible) {
                    layers[group].layer.addTo(this._map);
                }
            }
        }

        sites.forEach(function(site) {
            var location = leaflet.latLng([site.lat, site.lon]);
            var icon = layers[site.group].icon;
            var layer = layers[site.group].layer;
            var marker = leaflet.marker(location, { "title": site.name, "icon": icon });
            marker.addTo(layer);
            marker.bindPopup(site.html);
        });
    };

    /**
     * @param sites
     */
    View.prototype.setAllSites = function(sites)
    {
        this.clearSites();

        var layer = leaflet.layerGroup();
        var icon = leaflet.icon({
            iconUrl: "img/marker-green.png",
            iconRetinaUrl: "img/marker-green-2x.png",
            iconSize: [25, 39],
            iconAnchor: [12, 36],
            popupAnchor: [0, -30]
        });

        layer.viewGroupName = 'filtered';

        this._layersControl.addOverlay(
            layer,
            'Filter results'
        );

        layer.addTo(this._map);
        this._groupLayers.push(layer);

        sites.forEach(function(site) {
            var location = leaflet.latLng([site.lat, site.lon]);
            var marker = leaflet.marker(location, { "title": site.name, "icon": icon });
            marker.addTo(layer);
            marker.bindPopup(site.html);
        });
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
