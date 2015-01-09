var template = require('marko').load(require.resolve('./template.marko'));

module.exports = function(input, out) {
    var height = input.height;
    var width = input.width;

    template.render({
        widgetConfig: {
            lat: input.lat,
            lng: input.lng
        },
        height: height,
        width: width,
        className: input['class']
    }, out);
};
