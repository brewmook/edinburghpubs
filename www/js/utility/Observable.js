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
     * Buffers notifications until nothing is received for [milliseconds].
     * @param {number} milliseconds
     * @returns {Observable}
     */
    Observable.prototype.buffer = function(milliseconds)
    {
        var buffered = new Observable();
        var timeoutID = 0;
        this.subscribe(function() {
            var args = arguments;
            if (timeoutID > 0) {
                window.clearTimeout(timeoutID);
            }
            timeoutID = window.setTimeout(function() {
                buffered.raise.apply(buffered, args);
                timeoutID = 0;
            }, milliseconds);
        });
        return buffered;
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
     * Combines multiple Observables into one.
     *
     * Arguments to each source are cached and forwarded together, flattened.
     *
     * As an example, given 2 Observables A and B, where A raises 2 arguments and B raises 1,
     * then the returned Observable will raise 3: A1, A2, B1.
     *
     * @param {...Observable}
     * @static
     */
    Observable.Combine = function()
    {
        var combined = new Observable();
        var sources = Array.prototype.slice.call(arguments);
        var cache = new Array(sources.length);
        sources.forEach(function(source, index) {
            source.subscribe(function() {
                cache[index] = Array.prototype.slice.call(arguments);
                combined.raise.apply(combined, [].concat.apply([], cache));
            });
        });
        return combined;
    };

    return Observable;

});
