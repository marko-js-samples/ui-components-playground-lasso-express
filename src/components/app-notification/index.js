var template = require('marko').load(require.resolve('./template.marko'));

var NOTIFICATION_HEIGHT = 48;

// Export a render(input) method that can be used
// to render this UI component on the client
function renderer(input, out) {
    template.render(input, out);
}

function Widget() {
    this.top = 0-NOTIFICATION_HEIGHT;
}

Widget.prototype = {
    moveDown: function() {
        var self = this;
        this.top += NOTIFICATION_HEIGHT;
        var el = this.el;

        setTimeout(function() {
            el.style.top = self.top + 'px';
        }, 0);
    },

    remove: function() {
        var el = this.el;
        var self = this;

        el.style.opacity = 0;
        setTimeout(function() {
            self.destroy();
        }, 300);
    }
};

exports.Widget = Widget;

require('marko-widgets').makeRenderable(exports, renderer);