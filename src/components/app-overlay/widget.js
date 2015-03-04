function Widget() {
    this.$el = this.$();
    this._isVisible = false;
}

Widget.prototype = {
    hide: function() {
        if (!this._isVisible) {
            return;
        }

        this._isVisible = false;

        document.body.style.overflow = '';
        this.$el.removeClass('enabled');
        this.emit('hide');
    },
    show: function() {
        if (this._isVisible) {
            return;
        }

        this.emit('beforeShow');

        this._isVisible = true;

        document.body.style.overflow = 'hidden';
        this.$el.addClass('enabled');
        this.emit('show');
    },
    handleMaskClick: function() {
        this.hide();
    },
    handleCancelButtonClick: function() {
        this.emit('cancel', {});
        this.hide();
    },
    handleDoneButtonClick: function() {
        var preventDefault = false;

        this.emit('ok', {
            preventDefault: function() {
                preventDefault = true;
            }
        });

        if (!preventDefault) {
            this.hide();
        }
    },
    getBodyEl: function getBodyEl() {
        return this.getEl('body');
    }
};

exports.Widget = Widget;