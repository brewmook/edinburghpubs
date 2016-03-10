define(function() {

    /**
     * @param {Function} callback
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
     * Raises the event, notifying all subscribers of any arguments passed.
     */
    Observable.prototype.raise = function() {
        var args = arguments;
        this._subscriptions.forEach(function(s) {
            s.callback.apply(s.self, args);
        });
    };

    /**
     * Subscribe to changes to the underlying value.
     * @param {Function} callback
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

    /**
     * Combines multiple Observables into one notification.
     *
     * Arguments to each source are cached. All arguments to all sources are flattened before calling callback.
     *
     * @param {Observable[]} sources
     * @param {Function} callback
     * @static
     */
    Observable.Combine = function(sources, callback)
    {
        var cache = new Array(sources.length);
        sources.forEach(function(source, index) {
            source.subscribe(function() {
                cache[index] = Array.prototype.slice.call(arguments);
                callback.apply(callback, [].concat.apply([], cache));
            });
        });
    };

    return Observable;

});
