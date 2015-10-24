define(['app/ObservableValue'],
function (ObservableValue) {

    /**
     * @constructor
     */
    function TagsView()
    {
        var selected = new ObservableValue('');
        var filterTextbox = document.getElementById('filter');
        filterTextbox.addEventListener("change", function (e) {
            selected.set(filterTextbox.value);
        });
        this.selected = selected;
    }

    /**
     * @param {string[]} tags
     */
    TagsView.prototype.setTags = function(tags)
    {
        var datalist = document.getElementById('tags');
        while (datalist.firstChild) {
            datalist.removeChild(datalist.firstChild);
        }
        tags.forEach(function(tag) {
            var child = document.createElement('option');
            child.value = tag;
            datalist.appendChild(child);
        });
    };

    return TagsView;

});
