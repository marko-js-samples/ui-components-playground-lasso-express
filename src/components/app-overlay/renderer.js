var template = require('marko').load(require.resolve('./template.marko'));

exports.render = function(input, out) {
    var width = input.width || 800;

    template.render({
        width: width,
        invokeBody: input.invokeBody
    }, out);
};
