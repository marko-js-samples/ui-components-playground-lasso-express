var raptorRenderer = require('raptor-renderer');
var renderer = require('./renderer');

exports.render = function(input, callback) {
    return raptorRenderer.render(renderer, input, callback);
};