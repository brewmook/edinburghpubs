define(['leaflet'],
function (leaflet) {

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

    // -----------------------------------------------------------------------------------------------------------------
    // SitesView
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @param {Leaflet.Map} map
     * @constructor
     */
    function SitesView(map)
    {
        this._layer = leaflet.layerGroup();
        this._layer.addTo(map);
        this._icons = {};
    }

    /**
     * @param {SitesModel} sitesModel
     * @param {GroupsModel} groupsModel
     */
    SitesView.prototype.setup = function(sitesModel, groupsModel)
    {
        sitesModel.visibleSites.subscribe(function(sites)
        {
            this._layer.clearLayers();
            sites.forEach(function(site) {
                var marker = leaflet.marker(
                    site.geometry.coordinates,
                    {
                        title: site.properties.current.name,
                        icon: this._icons[site.properties.group]
                    });
                marker.bindPopup(bubbleHtml(site));
                marker.addTo(this._layer);
            }, this);
        }, this);

        groupsModel.groups.subscribe(function(groups)
        {
            this._icons = {};
            groups.forEach(function(group)
            {
                this._icons[group.name] = leaflet.icon({
                    iconUrl: "img/marker-" + group.colour + ".png",
                    iconRetinaUrl: "img/marker-" + group.colour + "-2x.png",
                    iconSize: [25, 39],
                    iconAnchor: [12, 36],
                    popupAnchor: [0, -30]
                });
            }, this);
        }, this);
    };

    return SitesView;

});
