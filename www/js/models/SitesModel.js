define(['utility/Observable'],
function (Observable) {

    /**
     * @param {Site[]} sites
     * @param {string} filterText
     * @returns {Site[]}
     */
    function sitesMatchingTag(sites, filterText) {
        return sites.filter(function(site) {
            return inList(filterText, site.properties.current.tags);
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
     * @param {Observable.<Site[]>} sites
     */
    function updateSites(tag, visibleGroups, allSites, sites)
    {
        var visibleSites;

        if (tag == '') {
            visibleSites = allSites.slice();
        }
        else {
            visibleSites = sitesMatchingTag(allSites, tag);
        }

        visibleSites = visibleSites.filter(function(site) { return inList(site.properties.group, visibleGroups); });
        sites.raise(visibleSites);
    }

    /**
     * @param {Site[]} allSites
     * @constructor
     */
    function SitesModel(allSites)
    {
        this.sites = new Observable();

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
        updateSites(this._tag, this._visibleGroups, this._allSites, this.sites);
    };

    /**
     * @param {string[]} visibleGroups - Labels of visible groups.
     */
    SitesModel.prototype.setVisibleGroups = function(visibleGroups)
    {
        this._visibleGroups = visibleGroups;
        updateSites(this._tag, this._visibleGroups, this._allSites, this.sites);
    };

    return SitesModel;
});
