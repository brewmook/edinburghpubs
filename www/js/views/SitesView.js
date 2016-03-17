define(['app/Observable', 'app/Set', 'leaflet'],
function (Observable, Set, leaflet) {

    // -----------------------------------------------------------------------------------------------------------------
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @param {number} price
     * @returns {string}
     */
    function formatPrice(price) {
        return "£"+price.toFixed(2);
    }

    /**
     * @param {string} url
     * @param {string} text
     * @returns {string}
     */
    function createLink(url, text)
    {
        return "<a href=\"http://brewmook.wordpress.com" + url + "\">" + text + "</a>";
    }

    /**
     * @param {Site} site
     * @returns {string}
     */
    function bubbleHtml(site)
    {
        var pub = site.properties.current;
        var history = site.properties.history;
        var text = "<b>" + pub.name + "</b>";
        if (pub.visits.length > 0) {
            var visit = pub.visits[0];
            if (visit.link)
                text = createLink(visit.link, text);
            if (visit.comment)
                text += "<br/><em>" + visit.comment + "</em>";
            if (visit.price > 0)
                text += "<br/>Price: " + formatPrice(visit.price);
        }
        if (history.length > 0) {
            var previous = [];
            for (var i = 0; i < history.length; ++i) {
                if (history[i].name != pub.name) {
                    if (history[i].visits.length > 0) {
                        previous.push(createLink(
                            history[i].visits[0].link,
                            history[i].name
                        ));
                    }
                    else {
                        previous.push(history[i].name);
                    }
                }
            }
            if (previous.length > 0) {
                text += "<br/>Previously known as " + previous.join(', ') + ".";
            }
        }
        if (pub.tags.length > 0) {
            text += "<br/>Tags: " + pub.tags.join(', ');
        }
        return text;
    }

    /**
     * @param {Site} site
     * @return {SitesView.Site}
     */
    function createViewSite(site)
    {
        return new SitesView.Site(
            site.properties.current.name,
            site.geometry.coordinates[0],
            site.geometry.coordinates[1],
            bubbleHtml(site)
        );
    }

    // -----------------------------------------------------------------------------------------------------------------
    // SitesView
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @param {Leaflet.Map} map
     * @constructor
     */
    function SitesView(map)
    {
        this._map = map;

        this._layersControl = leaflet.control.layers(null, null, {position: "bottomleft", collapsed: true});
        this._layersControl.addTo(this._map);

        this._visibleGroupsSet = new Set();
        this.visibleGroups = new Observable();

        /** @type {SitesView.Group[]} */
        this._groups = [];
    }

    /**
     * @param {SitesModel} sitesModel
     * @param {Grouper} grouper
     */
    SitesView.prototype.setup = function(sitesModel, grouper)
    {
        var visibleGroups = this.visibleGroups;
        var visibleGroupsSet = this._visibleGroupsSet;
        this._map.on('overlayadd', function(e) {
            if (visibleGroupsSet.add(e.name)) {
                visibleGroups.raise(visibleGroupsSet.items());
            }
        });
        this._map.on('overlayremove', function(e) {
            if (visibleGroupsSet.remove(e.name)) {
                visibleGroups.raise(visibleGroupsSet.items());
            }
        });

        var viewGroups = this._groups;
        sitesModel.sites.subscribe(function(sites) {
            var groups = grouper.groupSites(sites);
            viewGroups.forEach(function(viewGroup) {
                var group = groups.filter(function(g) { return viewGroup.label.indexOf(g.label) == 0; })[0];
                viewGroup.setSites(group.sites.map(createViewSite));
            });
        });
    };

    SitesView.prototype.addGroup = function(label, iconName, visible)
    {
        var group = new SitesView.Group(label, iconName);

        this._layersControl.addOverlay(group.layer, group.label);
        this._groups.push(group);

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
