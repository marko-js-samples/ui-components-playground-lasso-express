var raptorPubsub = require('raptor-pubsub');
var button = require('src/components/app-button');
var checkbox = require('src/components/app-checkbox');
var progressBar = require('src/components/app-progress-bar');
var extend = require('raptor-util/extend');
var defineWidget = require('marko-widgets').defineWidget;

var buttonSizes = ['small', 'normal', 'large'];
var currentButtonSize = 0;

module.exports = defineWidget({
    template: require.resolve('./template.marko'),

    getInitialState: function(input) {
        return {
            buttonSize: input.buttonSize || 'small',
            overlayVisible: false,
            checked: input.checked || {
                foo: false,
                bar: true,
                baz: false
            }
        };
    },

    getTemplateData: function(state, input) {
        var checked = state.checked;

        var checkedList = Object.keys(checked).filter(function(k) {
            return checked[k] === true;
        });

        return {
            checkedList: checkedList,
            checked: state.checked,
            buttonSize: state.buttonSize,
            overlayVisible: state.overlayVisible
        };
    },

    handleCheckboxToggle: function(event, sourceWidget) {
        // event.preventDefault();

        var name = event.data.name;

        // We treat complex objects stored in the state as immutable
        // since only a shallow compare is done to see if the state
        // has changed. Instead of modifying the "checked" object,
        // we create a new object with the updated state of what is
        // checked.
        var newChecked = extend({}, this.state.checked);
        newChecked[name] = event.checked;
        this.setState('checked', newChecked);
    },

    // update_checked: function(newValue) {
    //     var checkedItems = Object.keys(newValue).filter(function(name) {
    //         return newValue[name] === true;
    //     });
    //
    //     this.getEl('checkedDiv').innerHTML = checkedItems.join(', ');
    // },
    //
    // update_buttonSize: function(newValue) {
    //     var button = this.getWidget('resizableButton');
    //     button.setSize(newValue);
    //     button.setLabel('Change Button Size - ' + newValue);
    // },
    //
    update_overlayVisible: function(overlayVisible) {
        this.getWidget('overlay').setVisibility(overlayVisible);
    },

    handleShowOverlayButtonClick: function() {
        // this.setState('overlayVisible', true);
        this.getWidget('overlay').show();
    },

    handleOverlayHide: function() {
        // Synchronize the updated state of the o
        this.setState('overlayVisible', false);
    },

    handleOverlayShow: function() {
        this.setState('overlayVisible', true);
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
        this.setState('buttonSize', nextButtonSize);
    },

    handleToggleCheckboxButtonClick: function(event) {
        var checkbox = this.getWidget('toggleCheckbox');
        checkbox.toggle();
    }
});