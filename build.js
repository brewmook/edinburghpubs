({
    appDir: "www",
    baseUrl: "js",
    dir: "build",
    removeCombined: true,
    paths: {
        data: "empty:",
        leaflet: "empty:",
        voronoi: "empty:"
    },
    modules: [
        {name: "app"}
    ],
    fileExclusionRegExp: /^\.|^karma|^test|^leaflet/
})