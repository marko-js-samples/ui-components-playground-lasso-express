var template = require('marko').load(require.resolve('./template.marko'));

function renderer(input, out) {
    var rootAttrs = {};

    // The logic to determine the class names to apply to the root
    // element is relatively complex since it is based on the 'variant'
    // and the 'size' input so we are going to build the class names
    // in JavaScript instead of in the template.
    var classParts = ['app-button'];

    var type = 'button';

    var variant = input.variant || 'primary';
    if (variant && variant !== 'primary') {
        classParts.push('app-button-' + variant);
    }

    var size = input.size || 'normal';
    if (size && size !== 'normal') {
        classParts.push('app-button-' + size);
    }

    var splatAttrs = input['*'];
    if (splatAttrs) {
        var className = splatAttrs['class'];
        if (className) {
            delete splatAttrs['class'];
            classParts.push(className);
        }

        for (var splatAttr in splatAttrs) {
            if (splatAttrs.hasOwnProperty(splatAttr)) {
                rootAttrs[splatAttr] = splatAttrs[splatAttr];
            }
        }
    }

    rootAttrs['class'] = classParts.join(' ');

    template.render({
        type: type,
        widgetState: {
            size: size,
            variant: variant,
            '*': splatAttrs
        },
        renderBody: input.renderBody, // renderBody is a function we can use to render nested
                                      // content. will be undefined if no nested content.
        label: input.label, // The button label can come from nested content or the label attribute
        rootAttrs: rootAttrs
    }, out);
}

function Widget() {
}

Widget.prototype = {
    handleClick: function(event) {
        // Every Widget instance is also an EventEmitter instance.
        // We will emit a custom "click" event when a DOM click event
        // is triggered
        this.emit('click', {
            event: event // Pass along the DOM event in case it is helpful to others
        });
    },

    // Add any other methods here
    setVariant: function(variant) {
        this.setState('variant', variant);
    },

    setSize: function(size) {
        this.setState('size', size);
    },

    setLabel: function(label) {
        this.setState('label', label);
    }
};

exports.Widget = Widget;

require('marko-widgets').makeRenderable(exports, renderer);