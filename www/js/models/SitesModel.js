define(['app/ObservableValue'],
function (ObservableValue) {

    /**
     * @param {Site[]} sites
     * @param {string} filterText
     * @returns {Site[]}
     */
    function sitesMatchingTag(sites, filterText) {
        return sites.filter(function(site) {
            return inList(filterText, site.history[0].tags);
        });
    }

    /**
     * @param {string} group
     * @param {string[]} groups
     * @returns {boolean}
     */
    function inList(group, groups) {
        return groups.indexOf(group) != -1;
    }

    /**
     * @param {string} tag
     * @param {string[]} visibleGroups
     * @param {Site[]} allSites
     * @param {Grouper} grouper
     * @param {ObservableValue.<Site[]>} sites
     */
    function updateSites(tag, visibleGroups, allSites, grouper, sites)
    {
        var visibleSites;

        if (tag == '') {
            visibleSites = allSites.slice();
        }
        else {
            visibleSites = sitesMatchingTag(allSites, tag);
        }

        var groups = grouper.groupSites(visibleSites);
        var filteredGroups = groups.filter(function(g) { return inList(g.label, visibleGroups); });
        sites.set(filteredGroups.reduce(function(result, group) { return result.concat(group.sites); }, []));
    }

    /**
     * @param {Site[]} allSites
     * @param {Grouper} grouper
     * @constructor
     */
    function SitesModel(allSites, grouper)
    {
        this.sites = new ObservableValue(allSites.slice());
        this.grouper = grouper;

        this._allSites = allSites;
        this._tag = '';
        this._visibleGroups = [];
    }

    /**
     * @param {string} tag
     */
    SitesModel.prototype.setTag = function(tag)
    {
        this._tag = tag;
        updateSites(this._tag, this._visibleGroups, this._allSites, this.grouper, this.sites);
    };

    /**
     * @param {string[]} visibleGroups - Labels of visible groups.
     */
    SitesModel.prototype.setVisibleGroups = function(visibleGroups)
    {
        this._visibleGroups = visibleGroups;
        updateSites(this._tag, this._visibleGroups, this._allSites, this.grouper, this.sites);
    };

    return SitesModel;
});
