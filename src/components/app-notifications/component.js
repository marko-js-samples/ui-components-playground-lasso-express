var raptorPubsub = require('raptor-pubsub');

var nextId = 0;

module.exports = {
    onInput: function() {
        this.state = {
            notifications: []
        };
    },

    onMount: function() {
        var self = this;

        this.subscribeTo(raptorPubsub)
            .on('notification', function(eventArgs) {
                var message = eventArgs.message;
                self.addNotification(message);
            });
    },

    addNotification: function(message) {
        var notifications = this.state.notifications;
        var notificationId = 'notification' + (nextId++);
        notifications = [
                {
                    message: message,
                    id: notificationId
                }
            ].concat(notifications);

        this.setState('notifications', notifications);

        setTimeout(function() {
            this.removeNotification(notificationId);
        }.bind(this), 3000);
    },

    removeNotification: function(notificationId) {
        var notificationWidget = this.getWidget(notificationId);
        notificationWidget.fadeOut(function() {
            var notifications = this.state.notifications.filter(function(notification) {
                return notification.id !== notificationId;
            });
            this.setState('notifications', notifications);
        }.bind(this));
    }
};