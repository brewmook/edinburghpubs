define(function() {

    /**
     * @callback ObservableValue~notifyCallback
     * @param value
     */

    /**
     * A set of unique items that can be observed for changes.
     *
     * Items added and removed from the internal list must be equatable with ==.
     *
     * @constructor
     */
    function ObservableValue(initialValue) {
        this._value = initialValue;
        /** @type {ObservableValue~notifyCallback[]} */
        this._subscribers = [];
    }

    /**
     * Retrieves the value.
     */
    ObservableValue.prototype.get = function() {
        return this._value;
    };

    /**
     * Changes the internal value and then notifies subscribers.
     *
     * @param value
     */
    ObservableValue.prototype.set = function(value) {
        if (this._value != value) {
            this._value = value;
            this.notify();
        }
    };

    /**
     * Subscribe to changes to the underlying value.
     * @param {ObservableValue~notifyCallback} callback
     */
    ObservableValue.prototype.subscribe = function(callback) {
        this._subscribers.push(callback);
    };

    /**
     * Sends out the current value to all subscribers.
     */
    ObservableValue.prototype.notify = function() {
        for (var i = 0; i < this._subscribers.length; ++i) {
            this._subscribers[i](this._value);
        }
    };

    return ObservableValue;

});
