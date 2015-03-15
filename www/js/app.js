requirejs.config({
    baseUrl: "js/lib",
    urlArgs: "v=e8510bd2fa61f371a93c74cbfe4f941001109f35",
    paths: {
        app: "../app",
        data: "../../data",
        leaflet: "http://cdn.leafletjs.com/leaflet-0.7.3/leaflet",
        voronoi: "rhill-voronoi-core"
    },
    shim: {
        voronoi: { "exports": "Voronoi" }
    }
});

// Load the main app module to start the app
requirejs(["app/main"]);