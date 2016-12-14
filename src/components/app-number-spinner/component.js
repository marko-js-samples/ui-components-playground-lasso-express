// We can include a CSS file just by requiring it. Sweet!
// NOTE: If the line belows run on the server that is fine
//       because we make it a no-op using the following code
//       in our configure.js file:
//       require('lasso/node-require-no-op').enable('.css', '.less');
require('./style.css');

module.exports = {
    onInput: function(input) {
        var value = input.value || 0;

        this.state = {
            value: value
        };
    },

    handleIncrementClick: function(delta) {
        this.state.value += delta;
    },
    handleInputKeyUp: function(event, el) {
        var newValue = el.value;
        if (/^-?[0-9]+$/.test(newValue)) {
            this.state.value = parseInt(newValue, 10);
        }
    }
};