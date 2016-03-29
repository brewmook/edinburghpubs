define(['utility/Observable'],
function (Observable) {

    /**
     * @constructor
     */
    function FilterModel()
    {
        this.allTags = new Observable();
        this.currentTag = new Observable();
        this._currentTagCache = '';
    }

    /**
     * @param {FilterIntent} filterIntent
     */
    FilterModel.prototype.setup = function(filterIntent)
    {
        filterIntent.tagFilter.subscribe(function(tag) {
            if (this._currentTagCache != tag) {
                this._currentTagCache = tag;
                this.currentTag.raise(tag);
            }
        }, this);
    };

    FilterModel.prototype.setAllTags = function(allTags)
    {
        this.allTags.raise(allTags);
    };

    return FilterModel;
});
