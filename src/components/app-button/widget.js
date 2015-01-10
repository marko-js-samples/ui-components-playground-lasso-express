function Widget() {
    var _this = this;

    // NOTE: this.$() is short-hand for $(this.el)
    this.$().click(function(e) {
        // Every Widget instance is also an EventEmitter instance.
        // We will emit a custom "click" event when a DOM click event
        // is triggered
        _this.emit('click', {
            event: e // Pass along the DOM event in case it is helpful to others
        });
    });


}

Widget.prototype = {
    // Add any other methods here
    setVariant: function(variant) {
        // First remove all of the variant classes (this could be optimized)
        this.$().removeClass('app-button-secondary');

        // Then add the variant class (unless it is the default 'primary' variant)
        if (variant !== 'primary') {
            this.$().addClass('app-button-' + variant);
        }
    }
};

module.exports = Widget;