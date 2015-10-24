define(['app/ObservableSet', 'leaflet'],
function (ObservableSet, leaflet) {

    /**
     * @constructor
     */
    function SitesView(map)
    {
        this._map = map;

        this._layersControl = leaflet.control.layers(null, null, {position: "bottomright", collapsed: false});
        this._layersControl.addTo(this._map);
        this._groupLayers = [];

        var visibleGroups = new ObservableSet();
        this._map.on('overlayadd', function(e) { visibleGroups.add(e.layer.viewGroupId); });
        this._map.on('overlayremove', function(e) { visibleGroups.remove(e.layer.viewGroupId); });
        this.visibleGroups = visibleGroups;
    }

    SitesView.prototype._clearSites = function()
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
     * @param {SitesView.Group[]} groups
     * @param {bool} allowToggling
     */
    SitesView.prototype.showGroups = function(groups, allowToggling)
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

            groupLayers.push(layer);

            if (allowToggling) {
                layersControl.addOverlay(layer, group.label + " (" + group.icon + ")");
            }

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
     * @param {string} label
     * @param {number} lat
     * @param {number} lon
     * @param {string} html
     * @constructor
     */
    SitesView.Site = function(label, lat, lon, html) {
        this.label = label;
        this.lat = lat;
        this.lon = lon;
        this.html = html;
    };

    /**
     * @param {string} id
     * @param {string} label
     * @param {string} icon
     * @param {bool} visible
     * @param {SitesView.Site[]} sites
     * @constructor
     */
    SitesView.Group = function(id, label, icon, visible, sites) {
        this.id = id;
        this.label = label;
        this.icon = icon;
        this.visible = visible;
        this.sites = sites;
    };

    return SitesView;

});
