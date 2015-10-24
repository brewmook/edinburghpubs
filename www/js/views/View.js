define(['leaflet'],
function (leaflet) {

    /**
     * @constructor
     */
    function View()
    {
        this._map = leaflet.map("map");

        // Open Street Map attribution
        var osmAttr = '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
        leaflet.tileLayer(
            'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
            { attribution: osmAttr }
        ).addTo(this._map);
    }

    /**
     * @param {string} html
     */
    View.prototype.setStatusMessage = function(html)
    {
        document.getElementById('message').innerHTML = html;
    };

    return View;

});
