var raptorPubsub = require('raptor-pubsub');
var dom = require('marko-widgets/dom');
var markoWidgets = require('marko-widgets');
var button = require('src/components/app-button');
var checkbox = require('src/components/app-checkbox');
var progressBar = require('src/components/app-progress-bar');

function Widget(config) {
}

Widget.prototype = {
    updateChecked: function() {
        var checked = [];
        var $checked = this.$('#checked');
        var checkboxes = this.getEl('checkboxes');

        // You can can also get the widget associated with a DOM element:
        dom.forEachChildEl(checkboxes, function(checkboxEl) {
            var checkboxWidget = markoWidgets.getWidgetForEl(checkboxEl);
            if (checkboxWidget.isChecked()) {
                checked.push(checkboxWidget.data.name);
            }
            $checked.html(checked.length ? checked.join(', ') : '(none)');
        });
    },

    handleShowOverlayButtonClick: function() {
        this.getWidget('overlay').show();
    },

    handleShowNotificationButtonClick: function() {
        raptorPubsub.emit('notification', {
            message: 'This is a notification'
        });
    },

    handleOverlayOk: function() {
        raptorPubsub.emit('notification', {
            message: 'You clicked the "Done" button!'
        });
    },

    handleOverlayCancel: function() {
        raptorPubsub.emit('notification', {
            message: 'You clicked the "Cancel" button!'
        });
    },

    handleRenderButtonClick: function() {
        button.render({
                label: 'Hello World'
            })
            .appendTo(this.getEl('renderTarget'));
    },

    handleRenderCheckboxButtonClick: function() {
        checkbox.render({
                label: 'Hello World',
                checked: true
            })
            .appendTo(this.getEl('renderTarget'));
    },

    handleRenderProgressBarButtonClick: function() {
        progressBar.render({
                steps: [
                    {
                        label: 'Step 1'
                    },
                    {
                        label: 'Step 2'
                    },
                    {
                        label: 'Step 3',
                        active: true
                    },
                    {
                        label: 'Step 4'
                    }
                ]
            })
            .appendTo(this.getEl('renderTarget'));
    }
};

exports.Widget = Widget;