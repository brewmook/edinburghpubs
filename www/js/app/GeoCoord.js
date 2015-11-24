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

    /**
     * @param {GeoCoord} geocoord
     * @param {number} epsilon
     * @returns {boolean|undefined}
     */
    GeoCoord.prototype.almostEquals = function(geocoord, epsilon) {
        return GeoCoord.almostEquals(this, geocoord, epsilon);
    };

    /**
     * @param {GeoCoord} a
     * @param {GeoCoord} b
     * @param {number} epsilon
     * @returns {boolean|undefined}
     */
    GeoCoord.almostEquals = function(a, b, epsilon) {
        if (a instanceof GeoCoord && b instanceof GeoCoord) {
            return Math.abs(a.lat - b.lat) < epsilon
                && Math.abs(a.lon - b.lon) < epsilon;
        }
        return undefined;
    };

    return GeoCoord;

});
