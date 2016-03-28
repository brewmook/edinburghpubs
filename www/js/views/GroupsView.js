define(['utility/Observable', 'leaflet'],
function (Observable, leaflet) {

    // -----------------------------------------------------------------------------------------------------------------
    // Private functions
    // -----------------------------------------------------------------------------------------------------------------

    function createCheckbox(value, label, checked, changeObservable)
    {
        var labelEl = leaflet.DomUtil.create('label');

        var checkboxEl = leaflet.DomUtil.create('input','',labelEl);
        checkboxEl.setAttribute('type', 'checkbox');
        checkboxEl.setAttribute('value', value);
        checkboxEl.checked = checked;
        checkboxEl.addEventListener('change', function(e) { changeObservable.raise(e); });

        var spanEl= leaflet.DomUtil.create('span', '', labelEl);
        spanEl.textContent = label;

        return labelEl;
    }

    function findCheckbox(form, value)
    {
        return form.querySelector('input[value="' + value + '"');
    }

    // -----------------------------------------------------------------------------------------------------------------
    // GroupsView
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @param {Leaflet.Map} map
     * @constructor
     */
    function GroupsView(map)
    {
        this.checkboxChange = new Observable();
        var groupsDiv = leaflet.DomUtil.create('div', 'groups');

        this._form = leaflet.DomUtil.create('form','',groupsDiv);

        var groupsControl = leaflet.control({position: 'bottomleft'});
        groupsControl.onAdd = function(map) { return groupsDiv; };
        groupsControl.addTo(map);
    }

    /**
     * @param {GroupsModel} model
     */
    GroupsView.prototype.setup = function(model)
    {
        model.groups.subscribe(function(groups)
        {
            this._form.innerHTML = '';
            groups.forEach(function(group)
            {
                var checkbox = createCheckbox(
                    group.name,
                    group.name + ' (' + group.colour + ')',
                    group.visible,
                    this.checkboxChange
                );
                this._form.appendChild(checkbox);
            }, this);
        }, this);

        model.groupChange.subscribe(function(group)
        {
            var checkbox = findCheckbox(this._form, group.name);
            if (checkbox) {
                checkbox.checked = group.visible;
            }
        }, this);
    };

    return GroupsView;

});
