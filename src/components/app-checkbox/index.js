var template = require('marko').load(require.resolve('./template.marko'));

function renderer(input, out) {
    var label = input.label;
    var checked = input.checked === true;
    var className = 'app-checkbox';

    if (input['class']) {
        className += ' ' + input['class'];
    }

    if (checked) {
        className += ' checked';
    }

    template.render({
            // widgetConfig is a special property that is used to control
            // what data gets passed to the widget constructor
            widgetState: {
                data: input.data,
                checked: checked
            },
            className: className,
            label: label,
            renderBody: input.renderBody,
            checked: checked
        }, out);
}

exports.extendWidget = function(widget) {
    function isChecked() {
        return widget.state.checked === true;
    }

    function setChecked(newChecked) {
        if (newChecked !== widget.state.checked) {
            widget.setState('checked', !widget.state.checked);
            widget.emit('toggle', {
                checked: widget.state.checked,
                data: widget.state.data
            });
        }
    }

    function toggle() {
        setChecked(!widget.state.checked);
    }

    function getData() {
        return widget.state.data;
    }

    widget.on('click', toggle);

    widget.isChecked = isChecked;
    widget.setChecked = setChecked;
    widget.getData = getData;
    widget.toggle = toggle;
    widget.renderer = renderer;
};

require('marko-widgets').makeRenderable(exports, renderer);