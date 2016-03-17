define(function() {

    /**
     * A set of unique items.
     *
     * Items added and removed from the internal list must be equatable with ===.
     * @constructor
     */
    function Set() {
        this._items = [];
    }

    /**
     * Replaces the entire internal list with those in [items].
     * Items are filtered so that the internal list is unique.
     *
     * @param {Object[]} items - Items for the internal list.
     */
    Set.prototype.reset = function(items) {
        this._items = [];
        for (var index = 0; index < items.length; ++index) {
            if (this._items.indexOf(items[index]) === -1) {
                this._items.push(items[index]);
            }
        }
    };

    /**
     * Adds an item to the internal list if it isn't already there.
     *
     * @param item - Item to be added to the internal list.
     * @return {boolean} - True if item was added, false otherwise.
     */
    Set.prototype.add = function(item) {
        if (this._items.indexOf(item) === -1) {
            this._items.push(item);
            return true;
        }
        return false;
    };

    /**
     * Removes an item from the internal list if it exists.
     *
     * @param item - Item to be added to the internal list.
     * @return {boolean} - True if item was removed, false otherwise.
     */
    Set.prototype.remove = function(item) {
        var index = this._items.indexOf(item);
        if (index !== -1) {
            this._items.splice(index, 1);
            return true;
        }
        return false;
    };

    Set.prototype.items = function() {
        return this._items;
    };

    return Set;

});
