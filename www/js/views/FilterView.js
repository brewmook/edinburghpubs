define(['app/Observable', 'leaflet'],
function (Observable, leaflet) {

    /**
     * @param {Leaflet.Map} map
     * @constructor
     */
    function FilterView(map)
    {
        this.textBoxValue = new Observable();

        var filterDiv = leaflet.DomUtil.create('div', 'filter');

        var filterInput = leaflet.DomUtil.create('input','',filterDiv);
        filterInput.setAttribute('id', 'tagsfilter');
        filterInput.setAttribute('list', 'tagcompletions');
        filterInput.setAttribute('type', 'text');
        filterInput.setAttribute('placeholder', 'Filter');

        var filterDatalist = leaflet.DomUtil.create('datalist','',filterDiv);
        filterDatalist.setAttribute('id', 'tagcompletions');

        var filterControl = leaflet.control({position: 'topright'});
        filterControl.onAdd = function(map) { return filterDiv; };
        filterControl.addTo(map);

        // Without this, touch-based interfaces can't select the text input.
        leaflet.DomEvent.disableClickPropagation(filterInput);

        this._filterTextBox = filterInput;
        this._filterDatalist = filterDatalist;
    }

    /**
     * @param {FilterModel} model
     */
    FilterView.prototype.setup = function(model)
    {
        var textBox = this._filterTextBox;
        var textBoxValue = this.textBoxValue;
        textBox.addEventListener('change', function (e) {
            textBoxValue.raise(textBox.value);
        });

        var filterDatalist = this._filterDatalist;
        model.allTags.subscribe(function(tags) {
            while (filterDatalist.firstChild) {
                filterDatalist.removeChild(filterDatalist.firstChild);
            }
            tags.forEach(function(tag) {
                var child = document.createElement('option');
                child.value = tag;
                filterDatalist.appendChild(child);
            });
        });
    };

    return FilterView;

});
