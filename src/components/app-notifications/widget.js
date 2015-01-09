var raptorPubsub = require('raptor-pubsub');
var markoWidgets = require('marko-widgets');
var notification = require('src/components/app-notification');
var raptorDom = require('raptor-dom');

function Widget() {
    var el = this.el;
    var $el = this.$();

    var visible = false;

    function show() {
        if (visible) {
            return;
        }

        visible = true;
        $el.addClass('visible');
    }

    function moveDown() {

        raptorDom.forEachChildEl(el, function(el) {
            var notificationWidget = markoWidgets.getWidgetForEl(el);
            notificationWidget.moveDown();

        });
    }

    function addNotification(message) {
        show();

        var notificationWidget = notification.render({
                message: message
            })
            .appendTo(el)
            .getWidget();

        moveDown();

        setTimeout(function() {
            notificationWidget.remove();
        }, 3000);
    }

    raptorPubsub.on('notification', function(eventArgs) {
        var message = eventArgs.message;
        addNotification(message);
    });
}

module.exports = Widget;