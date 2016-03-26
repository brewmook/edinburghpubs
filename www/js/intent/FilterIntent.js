define(['utility/Observable'],
function (Observable) {

    /**
     * @constructor
     */
    function FilterIntent()
    {
        this.tagFilter = new Observable();
    }

    /**
     * @param {FilterView} view
     */
    FilterIntent.prototype.setup = function(view)
    {
        var tagFilter = this.tagFilter;
        view.textBoxChange.subscribe(function(event) {
            tagFilter.raise(event.target.value);
        });
    };

    return FilterIntent;
});
