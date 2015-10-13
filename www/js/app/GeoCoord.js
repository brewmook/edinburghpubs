define([], function() {

    /**
     * Represents a geographic coordinate.
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @constructor
     */
    function GeoCoord(lat, lon)
    {
        this.lat = lat;
        this.lon = lon;
    }

    return GeoCoord;

});
