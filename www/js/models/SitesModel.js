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
     * @param {string} s
     * @param {string[]} strings
     * @returns {boolean}
     */
    function inList(s, strings) {
        return strings.indexOf(s) != -1;
    }

    /**
     * @param {string} tag
     * @param {GroupsModel.Group[]} groups
     * @param {Site[]} allSites
     * @return {Site[]}
     */
    function filterSites(allSites, tag, groups)
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

        return visibleSites;
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
        this.visibleSites = new Observable();

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
        Observable.Combine(filterModel.currentTag, groupsModel.groupChange)
            .bufferMilliseconds(0)
            .subscribe(function(tag/*, group*/) {
                this._currentTag = tag || '';
                this.visibleSites.raise(filterSites(this._allSites, this._currentTag, this._groups));
            }, this);

        groupsModel.groups.subscribe(function(groups) {
            this._groups = groups;
            groupSites(this._groups, this._allSites);
            this.visibleSites.raise(filterSites(this._allSites, this._currentTag, this._groups));
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
        this.visibleSites.raise(filterSites(this._allSites, this._currentTag, this._groups));
    };

    return SitesModel;
});
