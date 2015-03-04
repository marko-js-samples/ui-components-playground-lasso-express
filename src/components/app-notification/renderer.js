var template = require('marko').load(require.resolve('./template.marko'));

// Export a render(input) method that can be used
// to render this UI component on the client
exports.render = function(input, out) {
    template.render(input, out);
};