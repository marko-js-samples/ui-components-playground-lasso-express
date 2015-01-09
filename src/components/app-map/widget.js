function Widget(config) {
    var el = this.el;
    var google = window.google;
    var Map = google.maps.Map;
    var LatLng = google.maps.LatLng;

    this._map = new Map(el, {
        zoom: 8,
        center: new LatLng(
            config.lat,
            config.lng)
    });
}

module.exports = Widget;
