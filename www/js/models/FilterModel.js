define(['utility/Observable'],
function (Observable) {

    /**
     * @constructor
     */
    function FilterModel()
    {
        this.allTags = new Observable();
    }

    /**
     * @param {FilterIntent} filterIntent
     * @param {SitesModel} sitesModel
     */
    FilterModel.prototype.setup = function(filterIntent, sitesModel)
    {
        // Temporary, should be doing the filter behaviour here instead.
        filterIntent.tagFilter.subscribe(function(tag) {
            sitesModel.setTag(tag);
        });
    };

    return FilterModel;
});
