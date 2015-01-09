function Widget() {
    var $mask = this.$('#mask');
    var _this = this;
    var $el = this.$();
    var isVisible = false;
    var bodyEl = this.getEl('body');

    this.show = function() {
        if (isVisible) {
            return;
        }

        _this.emit('beforeShow');

        isVisible = true;

        document.body.style.overflow = 'hidden';
        $el.addClass('enabled');
        _this.emit('show');
    };

    var hide = this.hide = function() {
        if (!isVisible) {
            return;
        }

        isVisible = false;

        document.body.style.overflow = '';
        $el.removeClass('enabled');
        _this.emit('hide');
    };

    this.getBodyEl = function() {
        return bodyEl;
    };

    this.widgets.doneButton.on('click', function() {
        var preventDefault = false;

        _this.emit('ok', {
            preventDefault: function() {
                preventDefault = true;
            }
        });

        if (!preventDefault) {
            hide();
        }
    });

    this.widgets.cancelButton.on('click', function() {
        hide();
    });

    $mask.click(hide);
}

module.exports = Widget;