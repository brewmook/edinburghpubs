define(['views/FilterView', 'views/GroupsView', 'views/MapView', 'views/SitesView', 'views/StatsView', 'views/TargetView', 'views/VoronoiView'],
function(FilterView, GroupsView, MapView, SitesView, StatsView, TargetView, VoronoiView) {

    /**
     * @constructor
     */
    function View()
    {
        var mapView = new MapView("map");
        this.filter = new FilterView(mapView.map);
        this.groups = new GroupsView(mapView.map);
        this.target = new TargetView(mapView.map);
        this.voronoi = new VoronoiView(mapView.map);
        this.sites = new SitesView(mapView.map);
        this.stats = new StatsView(mapView.map);
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
