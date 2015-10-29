define(function() {

    /**
     * @callback Grouper~predicate
     * @param {Site} site
     * @returns {bool}
     */

    /**
     * @constructor
     */
    function Grouper()
    {
        this._groups = [];
    }

    /**
     * @param {string} label
     * @param {Grouper~predicate} predicate
     */
    Grouper.prototype.addGroup = function(label, predicate)
    {
        this._groups.push({
            label: label,
            predicate: predicate
        });
    };

    /**
     * @param {Site[]} sites
     * @returns {Grouper.Group[]}
     */
    Grouper.prototype.groupSites = function(sites)
    {
        return this._groups.map(function(group) {
            return new Grouper.Group(
                group.label,
                sites.filter(group.predicate)
            );
        });
    };

    /**
     * @param {string} label
     * @param {Site[]} sites
     * @constructor
     */
    Grouper.Group = function(label, sites)
    {
        this.label = label;
        this.sites = sites;
    };

    return Grouper;

});
