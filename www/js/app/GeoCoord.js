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

    /**
     * @returns {string}
     */
    GeoCoord.prototype.toString = function() {
        return 'GeoCoord{' + this.lat + ', ' + this.lon + '}';
    };

    return GeoCoord;

});
