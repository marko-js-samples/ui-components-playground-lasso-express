require('./style.less');

var raptorPubsub = require('raptor-pubsub');
var markoWidgets = require('marko-widgets');
var notification = require('src/components/app-notification');
var dom = require('marko-widgets/dom');

module.exports = require('marko-widgets').defineComponent({
    template: require('./template.marko'),

    getTemplateData: function(input) {
        return {};
    },

    init: function() {
        this.$el = this.$();
        this.visible = false;
        var self = this;

        this.subscribeTo(raptorPubsub)
            .on('notification', function(eventArgs) {
                var message = eventArgs.message;
                self.addNotification(message);
            });
    },

    show: function() {
        if (this.visible) {
            return;
        }

        this.visible = true;
        this.$el.addClass('visible');
    },

    moveDown: function() {

        dom.forEachChildEl(this.el, function(el) {
            var notificationWidget = markoWidgets.getWidgetForEl(el);
            notificationWidget.moveDown();
        });
    },

    addNotification: function(message) {
        this.show();

        var notificationWidget = notification.render({
                message: message
            })
            .appendTo(this.el)
            .getWidget();

        this.moveDown();

        setTimeout(function() {
            notificationWidget.remove();
        }, 3000);
    }
});