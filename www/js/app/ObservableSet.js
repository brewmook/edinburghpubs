define(function() {

    /**
     * @callback ObservableSet~notifyCallback
     * @param {Array} items
     */

    /**
     * A set of unique items that can be observed for changes.
     *
     * Items added and removed from the internal list must be equatable with ==.
     *
     * @constructor
     */
    function ObservableSet() {
        this._items = [];
        /** @type {ObservableSet~notifyCallback[]} */
        this._subscribers = [];
    }

    /**
     * Adds an item to the internal list and then notifies subscribers.
     * If [item] is already in the list it's not added and no notification is performed.
     *
     * @param item - Item to be added to the internal list.
     */
    ObservableSet.prototype.add = function(item) {
        if (this._items.indexOf(item) == -1) {
            this._items.push(item);
            this.notify();
        }
    };

    /**
     * Removes an item from the internal list and then notifies subscribers.
     * If [item] isn't found in the list no notification is performed.
     *
     * @param item - Item to be added to the internal list.
     */
    ObservableSet.prototype.remove = function(item) {
        var index = this._items.indexOf(item);
        if (index != -1) {
            this._items.splice(index, 1);
            this.notify();
        }
    };

    /**
     * Subscribe to changes to the underlying list.
     * @param {ObservableSet~notifyCallback} callback
     */
    ObservableSet.prototype.subscribe = function(callback) {
        this._subscribers.push(callback);
    };

    /**
     * Sends out the current list of items to all observers.
     */
    ObservableSet.prototype.notify = function() {
        for (var i = 0; i < this._subscribers.length; ++i) {
            this._subscribers[i](this._items);
        }
    };

    return ObservableSet;

});
