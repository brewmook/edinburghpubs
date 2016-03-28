define(['utility/Observable'],
function (Observable) {

    function GroupsIntent() {
        this.groupChange = new Observable();
    }

    /**
     * @param {GroupsView} view
     * @constructor
     */
    GroupsIntent.prototype.setup = function(view) {
        view.checkboxChange.subscribe(function(event) {
            this.groupChange.raise(
                event.target.value,
                event.target.checked
            );
        }, this);
    };

    return GroupsIntent;
});
