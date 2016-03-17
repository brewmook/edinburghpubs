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
        Observable.Forward(view.textBoxValue, this.tagFilter);
    };

    return FilterIntent;
});
