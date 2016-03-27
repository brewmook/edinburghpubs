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
     * @param {string[]} tags1
     * @param {string[]} tags2
     * @returns {boolean}
     */
    function tagsIntersect(tags1, tags2)
    {
        return tags1.some(function(tag1) {
            return tags2.some(function(tag2) {
                return tag1 == tag2;
            });
        });
    }

    function isBlogged(site) {
        var current = site.properties.current;
        return current
            && current.visits.length
            && current.visits[0].link;
    }

    function isExcluded(site) {
        var excludedTags = ['Disqualified', 'Closed'];
        return tagsIntersect(site.properties.current.tags, excludedTags);
    }

    function groupSites(sites) {
        sites.forEach(function(site) {
            if (isBlogged(site)) {
                site.properties.group = "Visited";
            } else {
                if (isExcluded(site)) {
                    site.properties.group = "Excluded";
                } else {
                    site.properties.group = "Todo";
                }
            }
        });
    }

    /**
     * @param {Site[]} allSites
     * @constructor
     */
    function SitesModel(allSites)
    {
        this.sites = new Observable();

        groupSites(allSites);

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
