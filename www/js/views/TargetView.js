define(['app/geometry', 'leaflet'], function (geometry, leaflet) {

    /**
     * @param map - The Leaflet map object.
     * @constructor
     */
    function TargetView(map)
    {
        this._map = map;
        this._targetAreaLayer = leaflet.layerGroup().addTo(map);
    }

    /**
     * @param {GeoCoord} origin - The map origin.
     * @param {number} circleRadius - The circle radius in metres for target area.
     */
    TargetView.prototype.setTarget = function(origin, circleRadius)
    {
        this._map.fitBounds(geometry.earthSurfaceCircleBounds(origin, circleRadius));

        this._targetAreaLayer.clearLayers();

        // Add the target area circle
        this._targetAreaLayer.addLayer(leaflet.circle(
            origin,
            circleRadius,
            {
                color: '#c80',
                opacity: 1,
                fill: false
            }
        ));

        // Add a spot right in the middle
        this._targetAreaLayer.addLayer(leaflet.circle(
            origin,
            1.0,
            {
                color: '#f00',
                opacity: 1,
                fillColor: '#f00',
                fillOpacity: 1
            }
        ));
    };

    return TargetView;

});
