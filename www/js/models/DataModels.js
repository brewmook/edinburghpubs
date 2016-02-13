define(function() {

    /**
     * @constructor
     */
    function Target() {
        this.origin = new GeoCoord(0,0);
        this.radius = 0;
    }

    /**
     * @constructor
     */
    function Visit() {
        this.date = '';
        this.price = 0;
        this.link = '';
        this.comment = '';
    }

    /**
     * @constructor
     */
    function Pub() {
        this.name = '';
        this.opened = '';
        this.closed = '';
        /** @type {string[]} */
        this.tags = [];
        /** @type {Visit[]} */
        this.visits = [];
    }

    /**
     * @constructor
     */
    function Point(lat, lon) {
        /** @type {string} */
        this.type = "Point";
        /** @type {number[]} */
        this.coordinates = [lat, lon];
    }

    /**
     * @constructor
     */
    function Site() {
        this.type = "Feature";
        this.geometry = new Point(0,0);
        this.properties = {
            /** @type {Pub} */
            current: null,
            /** @type {Pub[]} */
            history: []
        }
    }

});
