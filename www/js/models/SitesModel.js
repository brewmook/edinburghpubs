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
     * @param {GroupsModel.Group[]} groups
     * @param {Site[]} allSites
     * @param {Observable.<Site[]>} sites
     */
    function updateSites(tag, groups, allSites, sites)
    {
        var visibleGroups = groups
            .filter(function(g) { return g.visible; })
            .map(function(g) { return g.name });

        var visibleSites = [];
        if (tag == '') {
            visibleSites = allSites.slice();
        }
        else {
            visibleSites = sitesMatchingTag(allSites, tag);
        }

        visibleSites = visibleSites.filter(function(site)
        {
            return inList(site.properties.group, visibleGroups);
        });

        sites.raise(visibleSites);
    }

    function groupSites(groups, sites) {
        sites.forEach(function(site) {
            site.properties.group = '';
            for (var i = 0; i < groups.length; ++i) {
                if (groups[i].filter(site)) {
                    site.properties.group = groups[i].name;
                    break;
                }
            }
        });
    }

    /**
     * @constructor
     */
    function SitesModel()
    {
        this.sites = new Observable();

        this._currentTag = '';
        this._allSites = [];
        this._groups = [];
    }

    /**
     * @param {FilterModel} filterModel
     * @param {GroupsModel} groupsModel
     */
    SitesModel.prototype.setup = function(filterModel, groupsModel)
    {
        filterModel.currentTag.subscribe(function(tag)
        {
            this._currentTag = tag;
            updateSites(this._currentTag, this._groups, this._allSites, this.sites);
        }, this);

        groupsModel.groups.subscribe(function(groups)
        {
            this._groups = groups;
            groupSites(this._groups, this._allSites);
            updateSites(this._currentTag, this._groups, this._allSites, this.sites);
        }, this);

        groupsModel.groupChange.subscribe(function(/*group*/)
        {
            updateSites(this._currentTag, this._groups, this._allSites, this.sites);
        }, this);
    };

    /**
     * @param {Site[]} allSites
     * @constructor
     */
    SitesModel.prototype.setSites = function(allSites)
    {
        this._allSites = allSites;
        groupSites(this._groups, this._allSites);
        updateSites(this._currentTag, this._groups, this._allSites, this.sites);
    };

    return SitesModel;
});
