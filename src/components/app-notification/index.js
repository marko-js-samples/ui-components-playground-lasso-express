var template = require('marko').load(require.resolve('./template.marko'));

// Export a render(input) method that can be used
// to render this UI component on the client
require('marko-widgets').renderable(exports, function render(input, out) {
    template.render(input, out);
});

var notificationHeight = 48;

function Widget() {
    var top = -48;
    var _this = this;

    var el = this.el;
    this.moveDown = function() {
        top += notificationHeight;
        setTimeout(function() {
            el.style.top = top + 'px';
        }, 10);
    };

    this.remove = function() {
        el.style.opacity = 0;
        setTimeout(function() {
            _this.destroy();
        }, 300);
    };
}

exports.Widget = Widget;