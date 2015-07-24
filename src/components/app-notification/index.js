require('./style.less');

var NOTIFICATION_HEIGHT = 48;

module.exports = require('marko-widgets').defineComponent({
    template: require('./template.marko'),

    init: function() {
        this.top = 0-NOTIFICATION_HEIGHT;
    },

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
});