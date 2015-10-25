define(['app/ObservableSet', 'leaflet'],
function (ObservableSet, leaflet) {

    function createIcon(name)
    {
        return leaflet.icon({
            iconUrl: "img/marker-" + name + ".png",
            iconRetinaUrl: "img/marker-" + name + "-2x.png",
            iconSize: [25, 39],
            iconAnchor: [12, 36],
            popupAnchor: [0, -30]
        });
    }

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
        this._map.on('overlayadd', function(e) { visibleGroups.add(e.name); });
        this._map.on('overlayremove', function(e) { visibleGroups.remove(e.name); });
        this.visibleGroups = visibleGroups;

        this._icons = {
            green: createIcon('green'),
            gold: createIcon('gold'),
            red: createIcon('red')
        };
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
     */
    SitesView.prototype.showGroups = function(groups)
    {
        this.visibleGroups.setNotifyEnabled(false);
        this._clearSites();

        var layersControl = this._layersControl;
        var groupLayers = this._groupLayers;
        var icons = this._icons;
        var map = this._map;

        groups.forEach(function(group) {

            var icon = icons[group.icon];

            var layer = leaflet.layerGroup();
            groupLayers.push(layer);

            layersControl.addOverlay(layer, group.label);

            if (group.initiallyVisible) {
                layer.addTo(map);
            }

            group.sites.forEach(function(site) {
                var location = leaflet.latLng([site.lat, site.lon]);
                var marker = leaflet.marker(location, {"title": site.label, "icon": icon});
                marker.bindPopup(site.html);
                marker.addTo(layer);
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
     * @param {*} data
     * @constructor
     */
    SitesView.Site = function(label, lat, lon, html, data) {
        this.label = label;
        this.lat = lat;
        this.lon = lon;
        this.html = html;
        this.data = data;
    };

    /**
     * @param {string} label
     * @param {string} icon
     * @param {bool} initiallyVisible
     * @param {SitesView.Site[]} sites
     * @constructor
     */
    SitesView.Group = function(label, icon, initiallyVisible, sites) {
        this.label = label;
        this.icon = icon;
        this.initiallyVisible = initiallyVisible;
        this.sites = sites;
    };

    return SitesView;

});