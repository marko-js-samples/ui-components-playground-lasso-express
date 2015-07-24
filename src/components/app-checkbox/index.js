require('./style.less');

module.exports = require('marko-widgets').defineComponent({
    template: require('./template.marko'),
    getInitialState: function(input) {
        return {
            checked: input.checked === true,
            checkboxClassName: input['class'] || input.checkboxClassName,
            data: input.data
        };
    },
    getTemplateData: function(state, input) {
        var checked = state.checked;
        var className = 'app-checkbox';

        if (state.checkboxClassName) {
            className += ' ' + state.checkboxClassName;
        }

        if (checked) {
            className += ' checked';
        }

        return {
            className: className,
            checked: checked
        };
    },
    getInitialBody: function(input) {
        return input.label || input.renderBody;
    },
    extendWidget: function(widget) {
        function isChecked() {
            return widget.state.checked === true;
        }

        function setChecked(newChecked) {
            if (newChecked !== widget.state.checked) {
                widget.setState('checked', !widget.state.checked);
            }
        }

        function toggle() {
            setChecked(!widget.state.checked);
        }

        function getData() {
            return widget.state.data;
        }

        widget.on('click', function() {
            var newChecked = !widget.state.checked;

            var defaultPrevented = false;

            widget.emit('toggle', {
                checked: newChecked,
                data: widget.state.data,
                preventDefault: function() {
                    defaultPrevented = true;
                }
            });

            if (!defaultPrevented) {
                widget.setState('checked', newChecked);
            }
        });

        widget.isChecked = isChecked;
        widget.setChecked = setChecked;
        widget.getData = getData;
        widget.toggle = toggle;
    }
});