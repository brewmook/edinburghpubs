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

        var visibleGroups = new ObservableSet();
        this._map.on('overlayadd', function(e) { visibleGroups.add(e.name); });
        this._map.on('overlayremove', function(e) { visibleGroups.remove(e.name); });
        this.visibleGroups = visibleGroups;

        /** @type {SitesView.Group[]} */
        this.groups = [];
    }

    SitesView.prototype.clearGroups = function()
    {
        this.visibleGroups.set([]);

        var map = this._map;
        var control = this._layersControl;
        this.groups.forEach(function(group) {
            control.removeLayer(group.layer);
            map.removeLayer(group.layer);
        });
        this.groups = [];
    };

    SitesView.prototype.addGroup = function(label, iconName, visible)
    {
        var group = new SitesView.Group(label, iconName);

        this._layersControl.addOverlay(group.layer, group.label);
        this.groups.push(group);

        if (visible) {
            group.layer.addTo(this._map);
        }
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
     * @param {string} label
     * @param {string} iconName
     * @constructor
     */
    SitesView.Group = function(label, iconName)
    {
        this.label = label;
        this.icon = leaflet.icon({
            iconUrl: "img/marker-" + iconName + ".png",
            iconRetinaUrl: "img/marker-" + iconName + "-2x.png",
            iconSize: [25, 39],
            iconAnchor: [12, 36],
            popupAnchor: [0, -30]
        });
        this.layer = leaflet.layerGroup();
    };

    /**
     * @param {SitesView.Site[]} sites
     */
    SitesView.Group.prototype.setSites = function(sites)
    {
        this.layer.clearLayers();

        var layer = this.layer;
        var icon = this.icon;
        sites.forEach(function(site) {
            var location = leaflet.latLng([site.lat, site.lon]);
            var marker = leaflet.marker(location, {"title": site.label, "icon": icon});
            marker.bindPopup(site.html);
            marker.addTo(layer);
        });
    };

    return SitesView;

});
