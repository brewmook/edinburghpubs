define(function() {

    /**
     * @constructor
     */
    function SiteViewModel(label, lat, lon, html) {
        this.label = label;
        this.lat = lat;
        this.lon = lon;
        this.html = html;
    }

    return SiteViewModel;

});