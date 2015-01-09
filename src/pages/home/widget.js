var button = require('src/components/app-button');
var checkbox = require('src/components/app-checkbox');

function Widget(config) {
    var widgets = this.widgets;
    var renderTarget = this.getEl('renderTarget');

    widgets.showOverlayButton.on('click', function() {
        widgets.overlay.show();
    });

    widgets.renderButtonButton.on('click', function() {
        button.render({
                label: 'Hello World'
            })
            .appendTo(renderTarget);
    });

    widgets.renderCheckboxButton.on('click', function() {
        checkbox.render({
            label: 'Hello World',
            checked: true
        })
        .appendTo(renderTarget);
    });
}

module.exports = Widget;