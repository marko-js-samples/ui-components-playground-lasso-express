function Widget(config) {
    this.activeIndex = config.activeIndex;
    this.stepNames = config.steps;
}

Widget.prototype = {
    _emitBeforeChange: function() {
        var cancelled = false;

        this.emit('beforeChange', {
            step: this.stepNames[this.activeIndex],
            preventDefault: function() {
                cancelled = true;
            }
        });

        return {
            cancelled: cancelled
        };
    },

    setCurrentStepIndex: function(index) {
        if (this.activeIndex === index) {
            return;
        }

        if (this._emitBeforeChange().cancelled) {
            return;
        }

        this.$('#step' + this.activeIndex).removeClass('active');

        this.activeIndex = index;

        var name = this.stepNames[this.activeIndex];

        this.$('#step' + this.activeIndex).addClass('active');

        this.emit('change', {
            name: name,
            index: index
        });
    },

    handleStepClick: function(event, el) {
        event.preventDefault();
        var index = parseInt(el.getAttribute('data-progress-step-index'), 10);
        this.setCurrentStepIndex(index);
    }
};

exports.Widget = Widget;