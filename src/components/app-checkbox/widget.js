function Widget(widgetConfig) {
    var $el = this.$();

    this.data = widgetConfig.data;

    var _this = this;

    this.$().click(function() {
        $el.toggleClass('checked');

        _this.emit('toggle', {
            checked: _this.isChecked(),
            data: widgetConfig.data
        });
    });

    function isChecked() {
        return $el.hasClass('checked');
    }

    this.isChecked = isChecked;

    this.setChecked = function(isChecked) {
        if (isChecked) {
            $el.addClass('checked');
        } else {
            $el.removeClass('checked');
        }
    };
}

module.exports = Widget;