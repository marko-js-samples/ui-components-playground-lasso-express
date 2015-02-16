var template = require('marko').load(require.resolve('./template.marko'));

// Export a render(input) method that can be used
// to render this UI component on the client
require('marko-widgets').renderable(exports, function render(input, out) {
    var height = input.height;
    var width = input.width;

    var style = '';
    if (height) {
        style += 'height: ' + height + ';';
    }

    if (width) {
        style += 'width: ' + width + ';';
    }

    template.render({
        widgetConfig: {
            lat: input.lat,
            lng: input.lng
        },
        height: height,
        width: width,
        style: style,
        className: input['class']
    }, out);
});

function Widget(config) {
    var el = this.el;
    var google = window.google;

    // If there is no internet connection then
    // the Google Maps API will fail to load and
    // window.google will be undefined
    if (google) {
        var Map = google.maps.Map;
        var LatLng = google.maps.LatLng;

        this._map = new Map(el, {
            zoom: 8,
            center: new LatLng(
                config.lat,
                config.lng)
            });
    } else {
        this.$().html('Failed to load Google Maps API. Is your internet connection working?');
    }

}

exports.Widget = Widget;