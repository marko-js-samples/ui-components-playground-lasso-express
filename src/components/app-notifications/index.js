var raptorPubsub = require('raptor-pubsub');
var markoWidgets = require('marko-widgets');
var notification = require('src/components/app-notification');
var dom = require('marko-widgets/dom');
var template = require('marko').load(require.resolve('./template.marko'));

function renderer(input, out) {
    template.render({}, out);
}

function Widget() {
    this.$el = this.$();
    this.visible = false;
    var self = this;

    raptorPubsub.on('notification', function(eventArgs) {
        var message = eventArgs.message;
        self.addNotification(message);
    });
}

Widget.prototype = {
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
};

exports.Widget = Widget;

require('marko-widgets').makeRenderable(exports, renderer);