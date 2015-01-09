var template = require('marko').load(require.resolve('./template.marko'));

module.exports = function render(input, context) {

    var rootAttrs = {};

    var classParts = ["app-button"];

    var type = 'button';

    var variant = input.variant;
    if (variant && variant !== 'primary') {
        classParts.push("app-button-" + variant);
    }

    var size = input.size;
    if (size && size !== 'normal') {
        classParts.push("app-button-" + size);
    }

    var splatAttrs = input['*'];
    if (splatAttrs) {
        var className = splatAttrs["class"];
        if (className) {
            delete splatAttrs["class"];
            classParts.push(className);
        }

        for (var splatAttr in splatAttrs) {
            if (splatAttrs.hasOwnProperty(splatAttr)) {
                rootAttrs[splatAttr] = splatAttrs[splatAttr];
            }
        }
    }

    rootAttrs["class"] = classParts.join(" ");

    template.render({
        type: type,
        invokeBody: input.invokeBody,
        label: input.label,
        rootAttrs: rootAttrs
    }, context);
};

