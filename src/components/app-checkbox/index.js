var template = require('marko').load(require.resolve('./template.marko'));

exports.renderer = function(input, out) {
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
            widgetConfig: {
                data: input.data
            },
            className: className,
            label: label,
            checked: checked
        }, out);
};

// Export a render(input) method that can be used
// to render this UI component on the client
exports.render = require('marko-widgets').renderFunc(exports.renderer);

exports.extendWidget = function(widget, widgetConfig) {
    var $el = widget.$();

    widget.data = widgetConfig.data;
    var checked = $el.hasClass('checked');

    function isChecked() {
        return checked;
    }

    function setChecked(newChecked) {
        if (checked === newChecked) {
            return;
        }

        checked = newChecked;

        if (checked) {
            $el.addClass('checked');
        } else {
            $el.removeClass('checked');
        }

        widget.emit('toggle', {
            checked: checked,
            data: widgetConfig.data
        });
    }

    widget.on('click', function() {
        setChecked(!checked);
    });

    widget.isChecked = isChecked;
    widget.setChecked = setChecked;
};