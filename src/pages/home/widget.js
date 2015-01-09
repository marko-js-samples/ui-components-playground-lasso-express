var raptorPubsub = require('raptor-pubsub');
var raptorDom = require('raptor-dom');
var markoWidgets = require('marko-widgets');
var button = require('src/components/app-button');
var checkbox = require('src/components/app-checkbox');
var progressBar = require('src/components/app-progress-bar');

function Widget(config) {
    var widgets = this.widgets;
    var renderTarget = this.getEl('renderTarget');
    var _this = this;

    widgets.showOverlayButton.on('click', function() {
        widgets.overlay.show();
    });

    widgets.showNotificationButton.on('click', function() {
        raptorPubsub.emit('notification', {
            message: 'This is a notification'
        });
    });

    widgets.overlay
        .on('ok', function() {
            raptorPubsub.emit('notification', {
                message: 'You clicked the "Done" button!'
            });
        })
        .on('cancel', function() {
            raptorPubsub.emit('notification', {
                message: 'You clicked the "Cancel" button!'
            });
        });

    widgets.renderButtonButton.on('click', function() {
        button.render({
                label: 'Hello World'
            })
            .appendTo(renderTarget);
    });

    widgets.renderCheckboxButton.on('click', function() {
        checkbox.render({
            label: 'Hello World',
            checked: true
        })
        .appendTo(renderTarget);
    });

    widgets.renderProgressBarButton.on('click', function() {
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
            .appendTo(renderTarget);
    });

    function showChecked() {
        var checked = [];

        // You can can also get the widget associated with a DOM element:
        raptorDom.forEachChildEl(_this.getEl('checkboxes'), function(checkboxEl) {
            var checkboxWidget = markoWidgets.getWidgetForEl(checkboxEl);
            if (checkboxWidget.isChecked()) {
                checked.push(checkboxWidget.data.name);
            }
            _this.$('#checked').html(checked.length ? checked.join(', ') : '(none)');
        });
    }

    // You can can also get the widget associated with a DOM element. We will
    // use that track to iterate over the checkboxes to iterate over all of
    // the checkboxes
    raptorDom.forEachChildEl(this.getEl('checkboxes'), function(checkboxEl) {
        var checkboxWidget = markoWidgets.getWidgetForEl(checkboxEl);
        _this.subscribeTo(checkboxWidget)
            .on('toggle', showChecked);
    });

    showChecked();
}

module.exports = Widget;