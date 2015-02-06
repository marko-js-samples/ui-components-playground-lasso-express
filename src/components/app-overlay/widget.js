function Widget() {
    var _this = this;
    var $el = this.$();
    var isVisible = false;
    var bodyEl = this.getEl('body');

    this.show = function show() {
        if (isVisible) {
            return;
        }

        _this.emit('beforeShow');

        isVisible = true;

        document.body.style.overflow = 'hidden';
        $el.addClass('enabled');
        _this.emit('show');
    };

    var hide = this.hide = function hide() {
        if (!isVisible) {
            return;
        }

        isVisible = false;

        document.body.style.overflow = '';
        $el.removeClass('enabled');
        _this.emit('hide');
    };

    this.getBodyEl = function getBodyEl() {
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
        _this.emit('cancel', {});

        hide();
    });

    this.handleMaskClick = function() {
        hide();
    };
}

module.exports = Widget;