var raptorPubsub = require('raptor-pubsub');
var button = require('src/components/app-button');
var checkbox = require('src/components/app-checkbox');
var progressBar = require('src/components/app-progress-bar');
var extend = require('raptor-util/extend');

var buttonSizes = ['small', 'normal', 'large'];
var currentButtonSize = 0;

function Widget(config) {
}

Widget.prototype = {
    updateChecked: function(event, sourceWidget) {
        var name = event.data.name;

        // Create objects in the state as immutable. Create
        // a new object that represents the change in checked
        // state
        var newChecked = extend({}, this.state.checked);
        newChecked[name] = event.checked;
        this.setState('checked', newChecked);
    },

    doUpdate: function(changedState, oldState) {
        var checked = this.state.checked;

        var checkedItems = Object.keys(checked).filter(function(name) {
            return checked[name] === true;
        });

        this.getEl('checkedDiv').innerHTML = checkedItems.join(', ');
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
    },

    handleChangeButtonSizeClick: function(event, button) {
        var nextButtonSize = buttonSizes[++currentButtonSize % buttonSizes.length];
        button.setSize(nextButtonSize);
        button.setLabel('Change Button Size - ' + nextButtonSize);
    },

    handleToggleCheckboxButtonClick: function(event) {
        var checkbox = this.getWidget('toggleCheckbox');
        checkbox.toggle();
    }
};

exports.Widget = Widget;