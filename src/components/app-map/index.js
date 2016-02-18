module.exports = require('marko-widgets').defineComponent({
    template: require('./template.marko'),
    getInitialState: function(input) {
        var height = input.height;
        var width = input.width;
        var className = input['class'];

        return {
            width: width,
            height: height,
            lat: input.lat,
            lng: input.lng,
            className: className
        };
    },
    getTemplateData: function(state, input) {
        var height = state.height;
        var width = state.width;

        var style = {
            height: height,
            width: width
        };

        return {
            style: style,
            className: input['class']
        };
    },
    init: function() {
        var el = this.el;
        var google = window.google;

        var lat = this.state.lat;
        var lng = this.state.lng;

        // If there is no internet connection then
        // the Google Maps API will fail to load and
        // window.google will be undefined
        if (google && google.maps && google.maps.Map) {
            var Map = google.maps.Map;
            var LatLng = google.maps.LatLng;

            this._map = new Map(el, {
                zoom: 8,
                center: new LatLng(
                    lat,
                    lng)
                });
        } else {
            this.$().html('Failed to load Google Maps API. Is your internet connection working?');
        }
    }
});