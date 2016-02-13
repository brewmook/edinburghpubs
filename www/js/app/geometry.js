define(['app/Vector', 'voronoi'],
function (Vector, Voronoi) {

    var EarthRadiusMetres = 6378137;
    var DegToRad = Math.PI/180.0;
    var voronoi = new Voronoi();

    function quadrance2d(x, y) {
        return x*x + y*y;
    }

    /**
     * Finds the intersections between a line and a circle at the origin.
     *
     * It is assumed that [point1] and [point2] are not coincident.
     *
     * @param {number[]} point1 - 2d point
     * @param {number[]} point2 - 2d point
     * @param {number} radius - Radius of the circle placed at the origin.
     * @returns {number[]}
     */
    function lineCircleIntersections2d(point1, point2, radius)
    {
        var dx = point2[0] - point1[0];
        var dy = point2[1] - point1[1];

        var A = dx * dx + dy * dy;
        var B = 2 * (dx * point1[0] + dy * point1[1]);
        var C = quadrance2d(point1[0],point1[1]) - radius * radius;

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
     * @param {number[]} startPoint - 2d point to start at
     * @param {number[]} endPoint - 2d point to end at
     * @param {number} circleRadius
     * @param {number} stepDegrees - Degrees to step by when adding circumference.
     * @returns {number[][]}
     */
    function clockwiseArc2d(startPoint, endPoint, circleRadius, stepDegrees)
    {
        var result = [];

        var startAngle = Math.atan2(startPoint[1], startPoint[0]);
        var endAngle = Math.atan2(endPoint[1], endPoint[0]);
        if (startAngle <= endAngle) {
            endAngle -= Math.PI*2;
        }

        var step = stepDegrees*Math.PI/180;
        var a = startAngle - step;
        while (a > endAngle) {
            result.push([
                circleRadius * Math.cos(a),
                circleRadius * Math.sin(a)
            ]);
            a -= step;
        }

        return result;
    }

    /**
     * Crops a polygon to a circle at the origin.
     *
     * Assumes polygon is concave, points are defined in a clockwise direction, and
     * all points are co-planar on a Z plane.
     *
     * @param {number[][]} polygon - Polygon of 2d points.
     * @param {number} circleRadius - Radius of a circle centred on the origin (0,0).
     * @param {number} fillStepDegrees - Degrees to step by when adding circumference.
     * @returns {number[][]}
     */
    function cropToCircle2d(polygon, circleRadius, fillStepDegrees)
    {
        if (polygon.length < 3) return polygon;

        var circleQ = circleRadius * circleRadius;
        var quadrances = polygon.map(function (loc) {
            return quadrance2d(loc[0], loc[1]);
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
                    intersections = lineCircleIntersections2d(
                        polygon[previousIndex],
                        polygon[index],
                        circleRadius
                    ).filter(function(t) { return t > 0 && t <= 1; });
                    if (intersections.length > 0) {
                        exitPoint = Vector.interpolate(
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
                intersections = lineCircleIntersections2d(
                    polygon[previousIndex],
                    polygon[index],
                    circleRadius
                ).filter(function(t) { return t > 0 && t <= 1; });
                if (intersections.length > 0) {
                    entryPoint = Vector.interpolate(
                        polygon[previousIndex],
                        polygon[index],
                        intersections[0]
                    );
                    if (exitPoint) {
                        result.push(exitPoint);
                        result = result.concat(clockwiseArc2d(exitPoint, entryPoint, circleRadius, fillStepDegrees));
                    }
                    result.push(entryPoint);
                    result.push(polygon[index]);
                }
            }
            else {
                // Outside the circle and will remain so.
                intersections = lineCircleIntersections2d(
                    polygon[previousIndex],
                    polygon[index],
                    circleRadius
                ).filter(function(t) { return t >= 0 && t < 1; });
                if (intersections.length == 2) {
                    entryPoint = Vector.interpolate(
                        polygon[previousIndex],
                        polygon[index],
                        intersections[0]
                    );
                    if (exitPoint) {
                        result.push(exitPoint);
                        result = result.concat(clockwiseArc2d(exitPoint, entryPoint, circleRadius, fillStepDegrees));
                    }
                    result.push(entryPoint);
                    exitPoint = Vector.interpolate(
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
            intersections = lineCircleIntersections2d(
                polygon[index],
                polygon[startIndex],
                circleRadius
            ).filter(function(t) { return t >= 0 && t < 1; });
            if (intersections.length > 0) {
                entryPoint = Vector.interpolate(
                    polygon[index],
                    polygon[startIndex],
                    intersections[0]
                );
                result.push(exitPoint);
                result = result.concat(clockwiseArc2d(exitPoint, entryPoint, circleRadius, fillStepDegrees));
                if (!Vector.equals(entryPoint, result[0])) {
                    result.push(entryPoint);
                }
            }
            else {
                entryPoint = result[0];
                result.push(exitPoint);
                result = result.concat(clockwiseArc2d(exitPoint, entryPoint, circleRadius, fillStepDegrees));
            }
        }

        return result;
    }

    /**
     * Project GeoCoords to 2d cartesian.
     *
     * @param {Object[]} pointFeatures - A list of GeoJSON point features
     * @param {number[]} origin - The geographic coordinates of the origin (lat, lon) on the sphere's surface.
     * @param {number} radius - The radius in metres of the sphere.
     * @returns {{x:number, y:number, z:number, feature:Object}[]}
     *     The [feature] member is the corresponding original feature from [pointFeatures].
     */
    function projectGeoCoordsToXY(pointFeatures, origin, radius)
    {
        var originLat = origin[0];
        var originLon = origin[1];
        var originLatRad = originLat * DegToRad;
        var cosOriginLat = Math.cos(originLatRad);
        var sinOriginLat = Math.sin(originLatRad);

        return pointFeatures.map(function(point) {
            var lat = point.geometry.coordinates[0];
            var lon = point.geometry.coordinates[1];
            var theta = (90 - lat) * DegToRad;
            var phi = (lon - originLon) * DegToRad;

            // to 3d cartesian coordinates
            var sinTheta = Math.sin(theta);
            var x = radius * sinTheta * Math.cos(phi);
            var y = radius * sinTheta * Math.sin(phi);
            var z = radius * Math.cos(theta);

            // rotate down to equator
            var newZ = z * cosOriginLat - x * sinOriginLat;

            // project onto new xy orientation
            return {
                feature: point,
                x: y,
                y: newZ
            };
        });
    }

    /**
     * Projects a set of cartesian coordinates onto a sphere.
     *
     * @param {number[][]} cartesians - A list of 2d points in cartesian space.
     * @param {number[]} origin - The geographic coordinates of the origin (lat, lon) on the sphere's surface to translate back to.
     * @param {number} sphereRadius - The radius in metres of the sphere.
     * @returns {number[][]} The geographic coordinates (lat, lon).
     */
    function cartesianToGeoCoord(cartesians, origin, sphereRadius)
    {
        var originLat = origin[0];
        var originLon = origin[1];
        var radToDeg = 180.0/Math.PI;
        var rotation = -originLat * DegToRad;
        var cosRotation = Math.cos(rotation);
        var sinRotation = Math.sin(rotation);

        return cartesians.map(function(point) {
            var rotatedX = sphereRadius;
            var rotatedZ = point[1];
            var y = point[0];

            // rotate back up to correct latitude
            var z = rotatedZ * cosRotation - rotatedX * sinRotation;
            var x = rotatedZ * sinRotation + rotatedX * cosRotation;

            var theta = Math.acos(z/sphereRadius) * radToDeg;
            var phi = Math.atan(y/x) * radToDeg;

            return [90.0 - theta, phi + originLon];
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
     * @callback voronoiCellCallback
     * @param {Object} feature - The original GeoJSON feature.
     * @param {number[][]} polygon - The geographic coordinates (lat, lon) of the voronoi cell surrounding [object].
     */

    /**
     * Compute the voronoi polygon of a set of objects on the surface of the Earth.
     *
     * @param {Object[]} pointFeatures - A list of GeoJSON point features.
     * @param {number[]} origin - The geographic coordinates of the origin (lat, lon) on the surface of the Earth.
     * @param {number} circleRadius - Radius in metres of circle around [origin] to crop results to.
     * @param {voronoiCellCallback} callback - Called for every cell calculated.
     */
    function earthSurfaceVoronoi(pointFeatures, origin, circleRadius, callback)
    {
        var computed = voronoi.compute(
            projectGeoCoordsToXY(pointFeatures, origin, EarthRadiusMetres),
            squareBoundingBox(2*circleRadius+100)
        );

        computed.cells.forEach(function(cell) {
            /** @type {number[][]} */
            var polygon = cell.halfedges.map(function (edge) {
                var start = edge.getStartpoint();
                return [start.x, start.y];
            });
            var croppedPolygon = cropToCircle2d(polygon, circleRadius, 3);
            var geoCoordPolygon = cartesianToGeoCoord(croppedPolygon, origin, EarthRadiusMetres);
            callback(cell.site.feature, geoCoordPolygon);
        });

        voronoi.recycle(computed);
    }

    /**
     * @param {number[]} origin - A geographic location [lat,lon]
     * @param {number} circleRadius
     * @returns {number[][]}
     */
    function earthSurfaceCircleBounds(origin, circleRadius)
    {
        var bounds = [
            [-circleRadius, -circleRadius],
            [ circleRadius,  circleRadius]
        ];
        return cartesianToGeoCoord(bounds, origin, EarthRadiusMetres);
    }

    return {
        projectGeoCoordsToXY: projectGeoCoordsToXY,
        cartesianToGeoCoord: cartesianToGeoCoord,
        clockwiseArc2d: clockwiseArc2d,
        cropToCircle2d: cropToCircle2d,
        earthSurfaceCircleBounds: earthSurfaceCircleBounds,
        earthSurfaceVoronoi: earthSurfaceVoronoi,
        lineCircleIntersections2d: lineCircleIntersections2d
    };

});
