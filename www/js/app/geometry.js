define(['app/GeoCoord', 'app/Cartesian', 'voronoi'], function (GeoCoord, Cartesian, Voronoi) {

    var EarthRadiusMetres = 6378137;

    function quadrance2d(point)
    {
        return point.x*point.x + point.y*point.y;
    }

    function interpolateNumbers(n1, n2, t) {
        return n1 + (n2-n1)*t;
    }

    function interpolateCartesians(point1, point2, t) {
        return new Cartesian(
            interpolateNumbers(point1.x, point2.x, t),
            interpolateNumbers(point1.y, point2.y, t),
            interpolateNumbers(point1.z, point2.z, t)
        );
    }

    /**
     * Finds the intersections between a line and a circle at the origin.
     *
     * It is assumed that [point1] and [point2] are not coincident.
     *
     * @param {Cartesian} point1
     * @param {Cartesian} point2
     * @param {number} radius - Radius of the circle placed at the origin.
     * @returns {number[]}
     */
    function lineCircleIntersections(point1, point2, radius)
    {
        var dx = point2.x - point1.x;
        var dy = point2.y - point1.y;

        var A = dx * dx + dy * dy;
        var B = 2 * (dx * point1.x + dy * point1.y);
        var C = quadrance2d(point1) - radius * radius;

        var det = B * B - 4 * A * C;
        if ((A <= 0.0000001) || (det < 0))
        {
            // No intersections
            return [];
        }
        else if (det == 0)
        {
            // Line is tangential to the circle
            var t = -B / (2 * A);
            return [t];
        }
        else
        {
            // Line intersectstwo
            var sqrtDet = Math.sqrt(det);
            var t1 = ((-B + sqrtDet) / (2 * A));
            var t2 = ((-B - sqrtDet) / (2 * A));

            if (t1 < t2) return [t1, t2];
            else return [t2, t1];
        }
    }

    /**
     * @param {Cartesian} startPoint
     * @param {Cartesian} endPoint
     * @param {number} circleRadius
     * @param {number} stepDegrees - Degrees to step by when adding circumference.
     * @returns {Cartesian[]}
     */
    function clockwiseArc(startPoint, endPoint, circleRadius, stepDegrees)
    {
        var result = [];

        var startAngle = Math.atan2(startPoint.y, startPoint.x);
        var endAngle = Math.atan2(endPoint.y, endPoint.x);
        if (startAngle <= endAngle) {
            endAngle -= Math.PI*2;
        }

        var step = stepDegrees*Math.PI/180;
        var a = startAngle - step;
        while (a > endAngle) {
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
     * Assumes polygon is concave and that points are defined in a clockwise direction.
     *
     * @param {Cartesian[]} polygon - Polygon points.
     * @param {number} circleRadius - Radius of a circle centred on the origin (0,0).
     * @param {number} fillStepDegrees - Degrees to step by when adding circumference.
     * @returns {Cartesian[]}
     */
    function cropToCircle(polygon, circleRadius, fillStepDegrees)
    {
        if (polygon.length < 3) return polygon;

        var circleQ = circleRadius * circleRadius;
        var quadrances = polygon.map(function (loc) {
            return quadrance2d(loc);
        });

        // Find a point inside the circle to start with
        var startIndex;
        for (startIndex = 0; startIndex < polygon.length; ++startIndex) {
            if (quadrances[startIndex] < circleQ) {
                break;
            }
        }

        var result = [];
        var inside = true;
        if (startIndex == polygon.length) {
            inside = false;
            startIndex = 0;
        }

        var previousIndex = (startIndex-1+polygon.length)%polygon.length;
        var exitPoint = null;
        var entryPoint = null;
        var intersections;

        for (var i = startIndex; i < polygon.length + startIndex; ++i) {
            var index = i % polygon.length;

            if (inside) {
                if (quadrances[index] > circleQ) {
                    // Inside the circle and will end up outside.
                    inside = false;
                    intersections = lineCircleIntersections(
                        polygon[previousIndex],
                        polygon[index],
                        circleRadius
                    ).filter(function(t) { return t > 0 && t <= 1; });
                    if (intersections.length > 0) {
                        exitPoint = interpolateCartesians(
                            polygon[previousIndex],
                            polygon[index],
                            intersections[0]
                        );
                    }
                }
                else {
                    // Inside the circle and will remain so.
                    result.push(polygon[index]);
                }
            }
            else if (quadrances[index] < circleQ) {
                // Outside the circle and will end up inside.
                inside = true;
                intersections = lineCircleIntersections(
                    polygon[previousIndex],
                    polygon[index],
                    circleRadius
                ).filter(function(t) { return t > 0 && t <= 1; });
                if (intersections.length > 0) {
                    entryPoint = interpolateCartesians(
                        polygon[previousIndex],
                        polygon[index],
                        intersections[0]
                    );
                    if (exitPoint) {
                        result.push(exitPoint);
                        result = result.concat(clockwiseArc(exitPoint, entryPoint, circleRadius, fillStepDegrees));
                    }
                    result.push(entryPoint);
                    result.push(polygon[index]);
                }
            }
            else {
                // Outside the circle and will remain so.
                intersections = lineCircleIntersections(
                    polygon[previousIndex],
                    polygon[index],
                    circleRadius
                ).filter(function(t) { return t >= 0 && t < 1; });
                if (intersections.length == 2) {
                    entryPoint = interpolateCartesians(
                        polygon[previousIndex],
                        polygon[index],
                        intersections[0]
                    );
                    if (exitPoint) {
                        result.push(exitPoint);
                        result = result.concat(clockwiseArc(exitPoint, entryPoint, circleRadius, fillStepDegrees));
                    }
                    result.push(entryPoint);
                    exitPoint = interpolateCartesians(
                        polygon[previousIndex],
                        polygon[index],
                        intersections[1]
                    );
                }
                else if (intersections.length == 1 && exitPoint == null) {
                    exitPoint = polygon[index];
                }
            }
            previousIndex = index;
        }

        if (exitPoint && !inside) {
            // We expect to end up back inside the circle
            intersections = lineCircleIntersections(
                polygon[index],
                polygon[startIndex],
                circleRadius
            ).filter(function(t) { return t >= 0 && t < 1; });
            if (intersections.length > 0) {
                entryPoint = interpolateCartesians(
                    polygon[index],
                    polygon[startIndex],
                    intersections[0]
                );
                result.push(exitPoint);
                result = result.concat(clockwiseArc(exitPoint, entryPoint, circleRadius, fillStepDegrees));
                if (!Cartesian.equals(entryPoint, result[0])) {
                    result.push(entryPoint);
                }
            }
            else {
                entryPoint = result[0];
                result.push(exitPoint);
                result = result.concat(clockwiseArc(exitPoint, entryPoint, circleRadius, fillStepDegrees));
            }
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
                y: newZ,
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
            var rotatedZ = cart.y;
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
            var croppedPolygon = cropToCircle(polygon, circleRadius, 3);
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
        calculateCartesians: calculateCartesians,
        cartesianToGeoCoord: cartesianToGeoCoord,
        clockwiseArc: clockwiseArc,
        cropToCircle: cropToCircle,
        earthSurfaceCircleBounds: earthSurfaceCircleBounds,
        earthSurfaceVoronoi: earthSurfaceVoronoi,
        lineCircleIntersections: lineCircleIntersections
    };

});
