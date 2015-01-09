var template = require('marko').load(require.resolve('./template.marko'));

module.exports = function(input, out) {
    var width = input.width || 800;
    var halfWidth = width >> 1;

    template.render({
        width: width,
        halfWidth: halfWidth,
        invokeBody: input.invokeBody
    }, out);
};
