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
        this._notifyEnabled = true;
    }

    /**
     * Replaces the entire internal list with those in [items], then notifies subscribers.
     * Items are filtered so that the internal list is unique.
     *
     * @param {Object[]} items - Items for the internal list.
     */
    ObservableSet.prototype.set = function(items) {
        this._items = [];
        for (var index = 0; index < items.length; ++index) {
            if (this._items.indexOf(items[index]) == -1) {
                this._items.push(items[index]);
            }
        }
        this.notify();
    };

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
        if (this._notifyEnabled) {
            for (var i = 0; i < this._subscribers.length; ++i) {
                this._subscribers[i](this._items);
            }
        }
    };

    /**
     * Allows notification to be switched off or on.
     * When it's switched back on, no new notification is sent.
     * @param {boolean} value
     */
    ObservableSet.prototype.setNotifyEnabled = function(value) {
        this._notifyEnabled = value;
    };

    return ObservableSet;

});
