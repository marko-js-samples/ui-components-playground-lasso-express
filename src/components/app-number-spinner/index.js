// We can include a CSS file just by requiring it. Sweet!
// NOTE: If the line belows run on the server that is fine
//       because we make it a no-op using the following code
//       in our configure.js file:
//       require('lasso/node-require-no-op').enable('.css', '.less');
require('./style.css');

module.exports = require('marko-widgets').defineComponent({
    // Use the following template to render our UI component
    template: require('./template.marko'),

    // Returns an object with properties that represent
    // the initial state of this widget. Over time
    // the state of the widget can change and it will
    // automatically rerender
    getInitialState: function(input) {
        var value = input.value || 0;

        // Our widget will consist of a single property
        // in the state and that will be the current
        // integer value of the number spinner
        return {
            value: value
        };
    },
    getTemplateData: function(state, input) {
        var value = state.value;

        var className = 'number-spinner';

        if (value < 0) {
            className += ' negative';
        } else if (value > 0) {
            className += ' positive';
        }
        return {
            value: value,
            className: className
        };
    },

    handleDecrementClick: function() {
        // Change the internal state (triggers a rerender)
        this.setState('value', this.state.value - 1);
    },
    handleIncrementClick: function() {
        // Change the internal state (triggers a rerender)
        this.setState('value', this.state.value + 1);
    },
    handleInputKeyUp: function(event, el) {
        var newValue = el.value;
        if (/^-?[0-9]+$/.test(newValue)) {
            this.setState('value', parseInt(newValue, 10));
        }
    }
});