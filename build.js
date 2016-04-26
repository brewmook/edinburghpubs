({
    appDir: "www",
    baseUrl: "js",
    dir: "build",
    removeCombined: true,
    paths: {
        data: "empty:",
        d3: "empty:",
        leaflet: "empty:",
        voronoi: "empty:"
    },
    modules: [
        {name: "app"}
    ],
    fileExclusionRegExp: /^\.|^karma|^test|^leaflet/
})