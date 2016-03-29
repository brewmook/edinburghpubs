define(['utility/Observable'],
function (Observable) {

    /**
     * @constructor
     */
    function GroupsModel()
    {
        this.groups = new Observable();
        this.groupChange = new Observable();

        /** @type {GroupsModel.Group[]} */
        this._groupsCache = [];
    }

    /**
     * @param {GroupsIntent} groupsIntent
     */
    GroupsModel.prototype.setup = function(groupsIntent)
    {
        groupsIntent.groupChange.subscribe(function(name, visible) {
            var matches = this._groupsCache.filter(function(g) { return g.name === name; });
            if (matches && matches[0].visible !== visible) {
                matches[0].visible = visible;
                this.groupChange.raise(matches[0]);
            }
        }, this);
    };

    GroupsModel.prototype.setGroups = function(groups)
    {
        this._groupsCache = groups.slice();
        this.groups.raise(this._groupsCache);
    };

    GroupsModel.Group = function(name, colour, visible, filter)
    {
        this.name = name;
        this.colour = colour;
        this.visible = visible;
        this.filter = filter;
    };

    return GroupsModel;
});
