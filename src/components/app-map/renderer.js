var template = require('marko').load(require.resolve('./template.marko'));

// Export a render(input) method that can be used
// to render this UI component on the client
exports.render = function(input, out) {
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