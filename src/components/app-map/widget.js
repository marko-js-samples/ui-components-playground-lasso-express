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
