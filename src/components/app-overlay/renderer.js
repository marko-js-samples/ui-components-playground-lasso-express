var template = require('marko').load(require.resolve('./template.marko'));

module.exports = function(input, out) {
    var width = input.width || 800;

    template.render({
        width: width,
        invokeBody: input.invokeBody
    }, out);
};
