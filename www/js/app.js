requirejs.config({
    baseUrl: "js/lib",
    urlArgs: "v=866a9da519620dd0316c35ebd60f4be6f93ddf45",
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