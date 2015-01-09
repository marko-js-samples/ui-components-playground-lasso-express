var template = require('marko').load(require.resolve('./template.marko'));

module.exports = function(input, out) {
    var label = input.label;
    var checked = input.checked === true;
    var className = input['class'];

    template.render({
            widgetConfig: {
                data: input.data
            },
            className: className,
            label: label,
            checked: checked
        }, out);
};