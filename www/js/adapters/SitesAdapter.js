define(function() {

    /**
     * @param {SitesModel} sitesModel
     * @param {SitesView} view
     * @constructor
     */
    function SitesAdapter(sitesModel, view)
    {
        view.visibleGroups.subscribe(function(groupLabels) {
            var groups = groupLabels.map(function(label) {
                var x = label.indexOf(' (');
                return label.substring(0, x);
            });
            sitesModel.setVisibleGroups(groups);
        });
    }

    return SitesAdapter;
});
