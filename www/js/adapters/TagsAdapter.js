define(function() {

    /**
     * @param {SitesModel} sitesModel
     * @param {TagsView} view
     * @constructor
     */
    function TagsAdapter(sitesModel, view)
    {
        view.selected.subscribe(function(tag) {
            sitesModel.setTag(tag);
        });
    }

    return TagsAdapter;
});
