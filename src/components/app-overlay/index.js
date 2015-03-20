module.exports = require('marko-widgets').defineWidget({
    template: require.resolve('./template.marko'),

    getTemplateData: function(state, input) {
        var width = input.width || 800;

        return {
            width: width
        };
    },

    getWidgetBody: function(state, input) {
        return input.renderBody;
    },

    init: function() {
        this.$el = this.$();
        this._isVisible = false;
    },

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
});