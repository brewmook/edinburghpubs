define(function() {

    /**
     * @callback Observable~Callback
     * @param value
     */

    /**
     * @param {Observable~Callback} callback
     * @param {*} self
     * @constructor
     * @private
     */
    function Subscription(callback, self)
    {
        this.callback = callback;
        this.self = self;
    }

    /**
     * Something that can be observed for changes.
     *
     * @constructor
     */
    function Observable() {
        /** @type {Subscription[]} */
        this._subscriptions = [];
    }

    /**
     * Raises the event, notifying all subscribers.
     *
     * @param event
     */
    Observable.prototype.raise = function(event) {
        this._subscriptions.forEach(function(s) {
            if (s.self) {
                s.callback.call(s.self, event);
            } else {
                s.callback(event);
            }
        });
    };

    /**
     * Subscribe to changes to the underlying value.
     * @param {Observable~Callback} callback
     * @param {*?} self - The object to use as 'this' in the callback.
     */
    Observable.prototype.subscribe = function(callback, self) {
        this._subscriptions.push(new Subscription(callback, self));
    };

    /**
     * @static
     * @param {Observable} source
     * @param {Observable} destination
     */
    Observable.Forward = function(source, destination)
    {
        source.subscribe(function(value) {
            destination.raise(value);
        });
    };

    return Observable;

});
