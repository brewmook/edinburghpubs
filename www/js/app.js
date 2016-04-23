requirejs.config({
    baseUrl: "js",
    paths: {
        data: "../data",
        d3: "../lib/d3/d3",
        leaflet: "http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet",
        voronoi: "../lib/rhill-voronoi-core"
    },
    shim: {
        voronoi: { "exports": "Voronoi" }
    }
});

// Load the main app module to start the app
requirejs(["app/main"]);
