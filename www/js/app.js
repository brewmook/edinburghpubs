requirejs.config({
    baseUrl: "js/lib",
    paths: {
        app: "../app",
        data: "../../data",
        leaflet: "http://cdn.leafletjs.com/leaflet-0.7.5/leaflet",
        voronoi: "rhill-voronoi-core"
    },
    shim: {
        voronoi: { "exports": "Voronoi" }
    }
});

// Load the main app module to start the app
requirejs(["app/main"]);
