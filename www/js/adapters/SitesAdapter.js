define(['views/SitesView'],
function (SitesView) {

    /**
     * @param {number} price
     * @returns {string}
     */
    function formatPrice(price) {
        return "£"+price.toFixed(2);
    }

    /**
     * @param {string} url
     * @param {string} text
     * @returns {string}
     */
    function createLink(url, text)
    {
        return "<a href=\"http://brewmook.wordpress.com" + url + "\">" + text + "</a>";
    }

    /**
     * @param {Site} site
     * @returns {string}
     */
    function bubbleHtml(site)
    {
        var pub = site.history[0];
        var text = "<b>" + pub.name + "</b>";
        if (pub.visits.length > 0) {
            var visit = pub.visits[0];
            if (visit.link)
                text = createLink(visit.link, text);
            if (visit.comment)
                text += "<br/><em>" + visit.comment + "</em>";
            if (visit.price > 0)
                text += "<br/>Price: " + formatPrice(visit.price);
        }
        if (site.history.length > 1) {
            var previous = [];
            for (var i = 1; i < site.history.length; ++i) {
                if (site.history[i].name != pub.name) {
                    if (site.history[i].visits.length > 0) {
                        previous.push(createLink(
                            site.history[i].visits[0].link,
                            site.history[i].name
                        ));
                    }
                    else {
                        previous.push(site.history[i].name);
                    }
                }
            }
            if (previous.length > 0) {
                text += "<br/>Previously known as " + previous.join(', ') + ".";
            }
        }
        if (pub.tags.length > 0) {
            text += "<br/>Tags: " + pub.tags.join(', ');
        }
        return text;
    }

    /**
     * @param {Site} site
     * @return {SitesView.Site}
     */
    function createViewSite(site)
    {
        return new SitesView.Site(
            site.history[0].name,
            site.lat,
            site.lon,
            bubbleHtml(site)
        );
    }

    /**
     * @param {SitesModel} sitesModel
     * @param {SitesView} view
     * @param {Grouper} grouper
     * @constructor
     */
    function SitesAdapter(sitesModel, view, grouper)
    {
        view.visibleGroups.subscribe(function(groupLabels) {
            var groups = groupLabels.map(function(label) {
                var x = label.indexOf(' (');
                return label.substring(0, x);
            });
            sitesModel.setVisibleGroups(groups);
        });

        sitesModel.sites.subscribe(function(sites) {
            var groups = grouper.groupSites(sites);
            view.groups.forEach(function(viewGroup) {
                var group = groups.filter(function(g) { return viewGroup.label.indexOf(g.label) == 0; })[0];
                viewGroup.setSites(group.sites.map(createViewSite));
            });
        });
    }

    return SitesAdapter;
});
