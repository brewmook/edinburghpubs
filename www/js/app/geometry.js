define(['voronoi'], function (Voronoi) {

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

    function quadrance2d(point)
    {
        return point.x*point.x + point.y*point.y;
    }

    // Find the points of intersection.
    function findLineCircleIntersections(radius, point1, point2)
    {
        var dx = point2.x - point1.x;
        var dy = point2.y - point1.y;

        var A = dx * dx + dy * dy;
        var B = 2 * (dx * point1.x + dy * point1.y);
        var C = quadrance2d(point1) - radius * radius;

        var det = B * B - 4 * A * C;
        if ((A <= 0.0000001) || (det < 0))
        {
            // no solution
            return null;
        }
        else if (det == 0)
        {
            // One solution.
            var t = -B / (2 * A);
            return {
                x: point1.x + t * dx,
                y: point1.y + t * dy,
                z: point1.z
            };
        }
        else
        {
            // Two solutions.
            var t1 = ((-B + Math.sqrt(det)) / (2 * A));
            if (t1 >= 0 && t1 <= 1) {
                return {x: point1.x + t1 * dx, y: point1.y + t1 * dy, z: point1.z};
            } else {
                var t2 = ((-B - Math.sqrt(det)) / (2 * A));
                return {x:point1.x + t2 * dx, y:point1.y + t2 * dy, z:point1.z};
            }
        }
    }

    function cropToCircle(cartesians, circleRadius)
    {
        var circleQ = circleRadius*circleRadius;
        var lastPointInsideCircle = -1;
        var lastPointOutsideCircle = -1;

        var quadrances = cartesians.map(function(loc) {
            return quadrance2d(loc);
        });

        for (var i = 0; i < cartesians.length; ++i) {
            var j = (i+1) % cartesians.length;

            if (lastPointInsideCircle < 0 && quadrances[i] <= circleQ && quadrances[j] > circleQ) {
                lastPointInsideCircle = i;
            }
            if (lastPointOutsideCircle < 0 && quadrances[i] > circleQ && quadrances[j] <= circleQ) {
                lastPointOutsideCircle = i;
            }
        }

        if (lastPointInsideCircle >= 0 && lastPointOutsideCircle >= 0) {
            var exitPoint = findLineCircleIntersections(
                circleRadius,
                cartesians[lastPointInsideCircle],
                cartesians[(lastPointInsideCircle+1)%cartesians.length]);
            var entryPoint = findLineCircleIntersections(
                circleRadius,
                cartesians[(lastPointOutsideCircle+1)%cartesians.length],
                cartesians[lastPointOutsideCircle]);

            if (exitPoint == null || entryPoint == null) {
                return cartesians;
            }

            var exitAngle = Math.atan2(exitPoint.y, exitPoint.x);
            var entryAngle = Math.atan2(entryPoint.y, entryPoint.x);
            if (exitAngle < entryAngle) {
                entryAngle -= Math.PI*2;
            }

            var points = [];
            points.push(entryPoint);
            var p = lastPointOutsideCircle;
            do {
                p = (p+1) % cartesians.length;
                points.push(cartesians[p]);
            } while(p != lastPointInsideCircle);
            points.push(exitPoint);

            // Now add points on the circle
            var step = 3*Math.PI/180;
            var a = exitAngle - step;
            while (a >= entryAngle) {
                points.push({
                    x: circleRadius * Math.cos(a),
                    y: circleRadius * Math.sin(a),
                    z: exitPoint.z
                });
                a -= step;
            }

            return points;
        }

        return cartesians;
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
     * @param {{x:number,y:number,z:number}[]} cartesians - A list of cartesian coordinates.
     * @param {GeoCoord} origin - The origin on the sphere's surface to translate back to.
     * @param {number} sphereRadius - The radius in metres of the sphere.
     * @returns {{lat:number,lng:number}[]} The Leaflet-friendly coordinates.
     */
    function cartesianToLatLng(cartesians, origin, sphereRadius)
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

            return {
                lat: 90.0 - theta,
                lng: phi + origin.lon
            };
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
     * @returns {{loc:Object, polygon:{lat:number,lng:number}[]}[]}
     */
    function earthSurfaceVoronoi(locations, origin, circleRadius)
    {
        var earthRadiusMetres = 6378137;
        var voronoi = new Voronoi();
        var computed = voronoi.compute(
            calculateCartesians(locations, origin, earthRadiusMetres),
            squareBoundingBox(2*circleRadius+100)
        );

        return computed.cells.map(function(cell) {
            var polygon = cell.halfedges.map(function (edge) {
                var start = edge.getStartpoint();
                return {x:start.x, y:start.y, z:earthRadiusMetres};
            });
            var croppedPolygon = cropToCircle(polygon, circleRadius);
            return {
                loc: cell.site.loc,
                polygon: cartesianToLatLng(croppedPolygon, origin, earthRadiusMetres)
            }
        });
    }

    return {
        GeoCoord: GeoCoord,
        earthSurfaceVoronoi: earthSurfaceVoronoi
    };

});
