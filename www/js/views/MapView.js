define(['leaflet'],
function (leaflet) {

    /**
     * @constructor
     */
    function MapView(mapDivId)
    {
        this.map = leaflet.map(mapDivId);
        leaflet.tileLayer(
            'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
            {
                id: 'mapbox/streets-v11',
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
                accessToken: 'pk.eyJ1IjoiYnJld21vb2siLCJhIjoiY2lqdWxoam42MGY4bXRzbTh2OXIzZDM1aCJ9.3Y4fgDB4imI3usjQWobQDA'
            }
        ).addTo(this.map);
    }

    return MapView;

});
