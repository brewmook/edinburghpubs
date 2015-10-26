define(function() {

    /**
     * @callback Grouper~createItem
     * @param {Site} site
     * @returns {SitesView.Site}
     */

    /**
     * @callback Grouper~createGroup
     * @param {string} labelPrefix
     * @param {string} icon
     * @param {bool} visible
     * @param {SitesView.Site[]} sites
     * @returns {SitesView.Group}
     */

    /**
     * @callback Grouper~predicate
     * @param {Site} site
     * @returns {bool}
     */

    /**
     * @param {Grouper~createItem} createItem
     * @param {Grouper~createGroup} createGroup
     * @constructor
     */
    function Grouper(createItem, createGroup)
    {
        this._groupers = [];
        this._createItem = createItem;
        this._createGroup = createGroup;
    }

    /**
     * @param {string} labelPrefix
     * @param {string} icon
     * @param {bool} visible
     * @param {Grouper~predicate} predicate
     */
    Grouper.prototype.addGroup = function(labelPrefix, icon, visible, predicate)
    {
        this._groupers.push({
            labelPrefix: labelPrefix,
            icon: icon,
            visible: visible,
            predicate: predicate
        });
    };

    /**
     * @param {Site[]} sites
     * @returns {SitesView.Group[]}
     */
    Grouper.prototype.groupSites = function(sites)
    {
        var createItem = this._createItem;
        var createGroup = this._createGroup;
        return this._groupers.map(function(grouper) {
            var group = sites.filter(grouper.predicate).map(createItem);
            return createGroup(grouper.labelPrefix, grouper.icon, grouper.visible, group);
        });
    };

    return Grouper;

});
