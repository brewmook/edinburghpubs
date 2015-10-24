define(['leaflet'],
function (leaflet) {

    /**
     * @constructor
     */
    function MapView(mapDivId)
    {
        this.map = leaflet.map(mapDivId);

        // Open Street Map attribution
        var osmAttr = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
        leaflet.tileLayer(
            'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
            { attribution: osmAttr }
        ).addTo(this.map);
    }

    return MapView;

});
