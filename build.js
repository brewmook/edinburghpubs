({
    appDir: "www",
    baseUrl: "js",
    dir: "build",
    removeCombined: true,
    paths: {
        data: "../data",
        leaflet: "empty:",
        voronoi: "empty:"
    },
    modules: [
        {name: "app"}
    ]
})