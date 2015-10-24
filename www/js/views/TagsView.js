define(['app/ObservableValue'],
function (ObservableValue) {

    /**
     * @param {string[]} tags
     * @constructor
     */
    function TagsView(tags)
    {
        var selected = new ObservableValue('');
        var filterTextbox = document.getElementById('filter');
        filterTextbox.addEventListener("change", function(e) {
            selected.set(filterTextbox.value);
        });
        this.selected = selected;

        var datalist = document.getElementById('tags');
        while (datalist.firstChild) {
            datalist.removeChild(datalist.firstChild);
        }
        tags.forEach(function(tag) {
            var child = document.createElement('option');
            child.value = tag;
            datalist.appendChild(child);
        });
    }

    return TagsView;

});
