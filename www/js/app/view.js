define(['leaflet'], function (leaflet) {

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

    /**
     *
     * @param {{lat:number, lon:number, name:string, html:string}[]} pins
     * @param {string} layerName
     * @param {string} iconName
     * @param {bool} visible
     */
    View.prototype.addPinsLayer = function(pins, layerName, iconName, visible)
    {
        var layer = leaflet.layerGroup();

        var icon = leaflet.icon({
            iconUrl: "img/marker-"+iconName+".png",
            iconRetinaUrl: "img/marker-"+iconName+"-2x.png",
            iconSize: [25, 39],
            iconAnchor: [12, 36],
            popupAnchor: [0, -30]
        });

        pins.forEach(function(pin) {
            var location = leaflet.latLng([pin.lat, pin.lon]);
            var marker = leaflet.marker(location, { "title": pin.name, "icon": icon });
            marker.addTo(layer);
            marker.bindPopup(pin.html);
        });
        this._layersControl.addOverlay(layer, layerName + ": " + pins.length);
        if (visible) {
            layer.addTo(this._map);
        }
    };

    View.prototype.addVoronoiCellsLayer = function(sites)
    {
        var layer = leaflet.layerGroup().addTo(this._map);
        sites.forEach(function(site) {
            leaflet.polygon(
                site.polygon.map(function(coord) { return leaflet.latLng([coord.lat, coord.lon]); }),
                {
                    fillColor: site.colour,
                    stroke: false,
                    fillOpacity: 0.5
                }
            ).addTo(layer);
        });
        this._layersControl.addOverlay(layer, 'Voronoi');
    };

    /**
     * @param {string} html
     */
    View.prototype.setStatusMessage = function(html)
    {
        document.getElementById('message').innerHTML = html;
    };

    return View;

});
