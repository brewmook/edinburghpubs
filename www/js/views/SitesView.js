define(['leaflet', 'd3'],
function (leaflet, d3) {

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
        this._map = map;
    }

    /**
     * @param {SitesModel} sitesModel
     * @param {GroupsModel} groupsModel
     */
    SitesView.prototype.setup = function(sitesModel, groupsModel)
    {
        var map = this._map;

        var svg = d3.select(map.getPanes().overlayPane).append("svg")
            .attr('xmlns:xlink','http://www.w3.org/1999/xlink')
        var defs = svg.append('defs');
        var markers = svg.append("g").attr("class", "leaflet-zoom-hide");

        var r = 11;
        var tail = 5;
        var t = 2;
        var pinPath = ['M', -r+t, -(r+tail-t), 'A', r, r, 0, 1, 1, r-t, -(r+tail-t), 'L', 0, 0, 'Z'].join(' ');

        svg.attr('class', 'sites-view');

        var transform = d3.geo.transform({point: projectPoint});
        var path = d3.geo.path().projection(transform);

        var resetter = { reset: function() {} };

        map.on("viewreset", function() { resetter.reset(); });

        // Use Leaflet to implement a D3 geometric transformation.
        var projectPointLatLng = new leaflet.LatLng(0,0);
        function projectPoint(x, y) {
            projectPointLatLng.lat = x;
            projectPointLatLng.lng = y;
            var point = map.latLngToLayerPoint(projectPointLatLng);
            this.stream.point(point.x, point.y);
        }

        sitesModel.visibleSites
            .bufferMilliseconds(0)
            .subscribe(function(sites) {
                resetter.reset = function() {
                    var padding = 40;
                    var bounds = path.bounds({"type": "FeatureCollection", "features": sites});
                    var topLeft = bounds[0];
                    var bottomRight = bounds[1];
                    topLeft[0] -= padding;
                    topLeft[1] -= padding;
                    bottomRight[0] += padding;
                    bottomRight[1] += padding;

                    var pins = markers.selectAll("use").data(sites);

                    // New pins
                    pins.enter().append('use');
                    // New and existing pins
                    pins.attr('xlink:href', function(site) { return '#'+site.properties.group; })
                        .attr('transform', function(d)
                        {
                            var loc = map.latLngToLayerPoint(d.geometry.coordinates);
                            return "translate(" + loc.x + "," + loc.y + ")";
                        });
                    // Remove unused
                    pins.exit().remove();

                    svg.attr("width", bottomRight[0] - topLeft[0] + padding)
                        .attr("height", bottomRight[1] - topLeft[1] + padding)
                        .style("left", topLeft[0] + "px")
                        .style("top", topLeft[1] + "px");

                    markers.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
                };
                resetter.reset();
            });

        groupsModel.groups.subscribe(function(groups)
        {
            var pins = defs.selectAll('g').data(groups);
            // New groups only
            var g = pins.enter().append('g');
            g.append('path').attr('d', pinPath);
            g.append('circle').attr('r',4).attr('cx',0).attr('cy',-(r+tail+t+2));
            // New and existing groups
            pins.attr('id', function(group) { return group.name; });
            // Groups to remove
            pins.exit().remove();
        });
    };

    return SitesView;

});
