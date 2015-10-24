define(['views/MapView', 'views/SitesView', 'views/TagsView', 'views/TargetView', 'views/VoronoiView'],
function(MapView, SitesView, TagsView, TargetView, VoronoiView) {

    /**
     * @constructor
     */
    function View()
    {
        var mapView = new MapView("map");
        this.target = new TargetView(mapView.map);
        this.voronoi = new VoronoiView(mapView.map);
        this.sites = new SitesView(mapView.map);
        this.tags = new TagsView();
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
