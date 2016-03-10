define(['views/MapView', 'views/SitesView', 'views/FilterView', 'views/TargetView', 'views/VoronoiView'],
function(MapView, SitesView, FilterView, TargetView, VoronoiView) {

    /**
     * @constructor
     */
    function View()
    {
        var mapView = new MapView("map");
        this.target = new TargetView(mapView.map);
        this.voronoi = new VoronoiView(mapView.map);
        this.sites = new SitesView(mapView.map);
        this.filter = new FilterView(mapView.map);
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
