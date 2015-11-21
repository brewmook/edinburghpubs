define(['app/GeoCoord', 'app/Cartesian', 'voronoi'], function (GeoCoord, Cartesian, Voronoi) {

    var EarthRadiusMetres = 6378137;

    function quadrance2d(point)
    {
        return point.x*point.x + point.y*point.y;
    }

    /**
     * Finds the intersection between a line and a circle at the origin.
     *
     * It is assumed that [point1] and [point2] are not coincident.
     *
     * If both points are outside the circle but there is an intersection, it only
     * provides the first intersection point along the line from [point1] to [point2].
     *
     * @param {number} radius - Radius of the circle placed at the origin.
     * @param {Cartesian} point1 -
     * @param {Cartesian} point2
     * @returns {?Cartesian}
     */
    function findLineCircleIntersection(radius, point1, point2)
    {
        var dx = point2.x - point1.x;
        var dy = point2.y - point1.y;

        var A = dx * dx + dy * dy;
        var B = 2 * (dx * point1.x + dy * point1.y);
        var C = quadrance2d(point1) - radius * radius;

        var det = B * B - 4 * A * C;
        if ((A <= 0.0000001) || (det < 0))
        {
            // No solution
            /** @todo Both points inside/outside the circle? */
            return null;
        }
        else if (det == 0)
        {
            // One solution.
            /** @todo Line tangential to the circle? */
            var t = -B / (2 * A);
            return new Cartesian(
                point1.x + t * dx,
                point1.y + t * dy,
                point1.z
            );
        }
        else
        {
            // Two solutions.
            var t1 = ((-B + Math.sqrt(det)) / (2 * A));
            if (t1 >= 0 && t1 <= 1) {
                // First solution lies somewhere on the line between p1 and p2.
                return new Cartesian(point1.x + t1 * dx, point1.y + t1 * dy, point1.z);
            } else {
                /** @todo What does this solution mean in practical terms? */
                var t2 = ((-B - Math.sqrt(det)) / (2 * A));
                return new Cartesian(point1.x + t2 * dx, point1.y + t2 * dy, point1.z);
            }
        }
    }

    /**
     * @param {Cartesian} startPoint
     * @param {Cartesian} endPoint
     * @param {number} circleRadius
     * @returns {Cartesian[]}
     */
    function anticlockwiseArc(startPoint, endPoint, circleRadius)
    {
        var result = [];

        var startAngle = Math.atan2(startPoint.y, startPoint.x);
        var endAngle = Math.atan2(endPoint.y, endPoint.x);
        if (startAngle < endAngle) {
            endAngle -= Math.PI*2;
        }

        var step = 3*Math.PI/180;
        var a = startAngle - step;
        while (a >= endAngle) {
            result.push(new Cartesian(
                circleRadius * Math.cos(a),
                circleRadius * Math.sin(a),
                startPoint.z
            ));
            a -= step;
        }

        return result;
    }

    /**
     * Crops a polygon to a circle at the origin.
     *
     * Assumes polygon is concave and that points are defined in anti-clockwise direction.
     *
     * @param {Cartesian[]} polygon - Polygon points.
     * @param {number} circleRadius - Radius of a circle centred on the origin (0,0).
     * @returns {Cartesian[]}
     */
    function cropToCircle(polygon, circleRadius)
    {
        var circleQ = circleRadius * circleRadius;
        var quadrances = polygon.map(function (loc) {
            return quadrance2d(loc);
        });

        // Find a point inside the circle to start with
        var firstIndexInside;
        for (firstIndexInside = 0; firstIndexInside < polygon.length; ++firstIndexInside) {
            if (quadrances[firstIndexInside] <= circleQ) {
                break;
            }
        }

        // Did we find any point inside the circle?
        if (firstIndexInside == polygon.length) {
            return [];
        }

        var lastIndex = -1;
        var result = [];
        var inside = true;
        var exitPoint = null;
        var entryPoint = null;
        for (var i = firstIndexInside; i < polygon.length + firstIndexInside; ++i) {
            var index = i % polygon.length;
            if (inside) {
                if (quadrances[index] > circleQ) {
                    inside = false;
                    exitPoint = findLineCircleIntersection(
                        circleRadius,
                        polygon[lastIndex],
                        polygon[index]
                    );
                    result.push(exitPoint);
                }
                else {
                    result.push(polygon[index]);
                }
            }
            else {
                if (quadrances[index] <= circleQ) {
                    inside = true;
                    entryPoint = findLineCircleIntersection(
                        circleRadius,
                        polygon[lastIndex],
                        polygon[index]
                    );
                    result = result.concat(anticlockwiseArc(exitPoint, entryPoint, circleRadius));
                    result.push(entryPoint);
                    result.push(polygon[index]);
                }
            }
            lastIndex = index;
        }

        if (!inside) {
            entryPoint = findLineCircleIntersection(
                circleRadius,
                polygon[lastIndex],
                polygon[firstIndexInside]
            );
            result = result.concat(anticlockwiseArc(exitPoint, entryPoint, circleRadius));
            result.push(entryPoint);
        }

        return result;
    }

    /**
     * Convert sphere-space coordinates to cartesian coordinates.
     *
     * @param {GeoCoord[]} locations - A list of GeoCoord (or GeoCoord-like) objects.
     * @param {GeoCoord} origin - The origin on the sphere's surface.
     * @param {number} sphereRadius - The radius in metres of the sphere.
     * @returns {{x:number, y:number, z:number, loc:Object}[]}
     *     The loc object is the corresponding original object from locations.
     */
    function calculateCartesians(locations, origin, sphereRadius)
    {
        var degToRad = Math.PI/180.0;
        var rotation = origin.lat * degToRad;
        var cosRotation = Math.cos(rotation);
        var sinRotation = Math.sin(rotation);

        return locations.map(function(loc) {
            var theta = (90 - loc.lat) * degToRad;
            var phi = (loc.lon - origin.lon) * degToRad;

            // to 3d cartesian coordinates
            var sinTheta = Math.sin(theta);
            var x = sphereRadius * sinTheta * Math.cos(phi);
            var y = sphereRadius * sinTheta * Math.sin(phi);
            var z = sphereRadius * Math.cos(theta);

            // rotate down to equator
            var newZ = z * cosRotation - x * sinRotation;
            var newX = z * sinRotation + x * cosRotation;

            // project onto new xy orientation
            return {
                loc: loc,
                x: y,
                y: -newZ,
                z: newX
            };
        });
    }

    /**
     * Projects a set of cartesian coordinates back into spherical space.
     *
     * @param {Cartesian[]} cartesians - A list of cartesian coordinates.
     * @param {GeoCoord} origin - The origin on the sphere's surface to translate back to.
     * @param {number} sphereRadius - The radius in metres of the sphere.
     * @returns {GeoCoord[]} The Leaflet-friendly coordinates.
     */
    function cartesianToGeoCoord(cartesians, origin, sphereRadius)
    {
        var degToRad = Math.PI/180.0;
        var radToDeg = 180.0/Math.PI;
        var rotation = -origin.lat * degToRad;
        var cosRotation = Math.cos(rotation);
        var sinRotation = Math.sin(rotation);

        return cartesians.map(function(cart) {
            var rotatedX = cart.z;
            var rotatedZ = -cart.y;
            var y = cart.x;

            // unrotate back up to correct latitude
            var z = rotatedZ * cosRotation - rotatedX * sinRotation;
            var x = rotatedZ * sinRotation + rotatedX * cosRotation;

            var theta = Math.acos(z/sphereRadius) * radToDeg;
            var phi = Math.atan(y/x) * radToDeg;

            return new GeoCoord(90.0 - theta, phi + origin.lon);
        });
    }

    function squareBoundingBox(size)
    {
        var halfSize = size/2;
        return {
            xl: -halfSize,
            xr: halfSize,
            yt: -halfSize,
            yb: halfSize
        };
    }

    /**
     * Compute the voronoi polygon of a set of objects on the surface of the Earth.
     *
     * @param {GeoCoord[]} locations - A list of GeoCoord (or GeoCoord-like) objects
     * @param {GeoCoord} origin - Origin on the surface of the Earth.
     * @param {number} circleRadius - Radius in metres of circle around [origin] to crop results to.
     * @returns {{loc:Object, polygon:GeoCoord[]}[]}
     */
    function earthSurfaceVoronoi(locations, origin, circleRadius)
    {
        var voronoi = new Voronoi();
        var computed = voronoi.compute(
            calculateCartesians(locations, origin, EarthRadiusMetres),
            squareBoundingBox(2*circleRadius+100)
        );

        return computed.cells.map(function(cell) {
            /** @type {Cartesian[]} */
            var polygon = cell.halfedges.map(function (edge) {
                var start = edge.getStartpoint();
                return new Cartesian(start.x, start.y, EarthRadiusMetres);
            });
            var croppedPolygon = cropToCircle(polygon, circleRadius);
            return {
                loc: cell.site.loc,
                polygon: cartesianToGeoCoord(croppedPolygon, origin, EarthRadiusMetres)
            }
        });
    }

    function earthSurfaceCircleBounds(origin, circleRadius)
    {
        var bounds = [
            new Cartesian(-circleRadius, -circleRadius, EarthRadiusMetres),
            new Cartesian( circleRadius,  circleRadius, EarthRadiusMetres)
        ];
        return cartesianToGeoCoord(bounds, origin, EarthRadiusMetres);
    }

    return {
        cropToCircle: cropToCircle,
        earthSurfaceCircleBounds: earthSurfaceCircleBounds,
        earthSurfaceVoronoi: earthSurfaceVoronoi
    };

});
