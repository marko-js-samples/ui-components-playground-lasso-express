var template = require('marko').load(require.resolve('./template.marko'));

module.exports = function(input, out) {
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
};
