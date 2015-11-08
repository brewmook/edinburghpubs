define(['app/ObservableValue', 'leaflet'],
function (ObservableValue, leaflet) {

    /**
     * @constructor
     */
    function TagsView(map)
    {
        var filterDiv = leaflet.DomUtil.create('div', 'filter');
        var filterControl = leaflet.control({position: 'topright'});
        filterControl.onAdd = function(map) { return filterDiv; };
        filterControl.addTo(map);

        var filterLabel = leaflet.DomUtil.create("label","",filterDiv);
        filterLabel.setAttribute("for", "tagsfilter");
        filterLabel.innerText = "Filter: ";

        var filterInput = leaflet.DomUtil.create("input","",filterDiv);
        filterInput.setAttribute("id", "tagsfilter");
        filterInput.setAttribute("list", "tagcompletions");
        filterInput.setAttribute("type", "text");

        var filterDatalist = leaflet.DomUtil.create("datalist","",filterDiv);
        filterDatalist.setAttribute("id", "tagcompletions");
        this._filterDatalist = filterDatalist;

        var selected = new ObservableValue('');
        filterInput.addEventListener("change", function (e) {
            selected.set(filterInput.value);
        });
        this.selected = selected;
    }

    /**
     * @param {string[]} tags
     */
    TagsView.prototype.setTags = function(tags)
    {
        var datalist = this._filterDatalist;
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
