var $ = require('jquery');

function Widget(config) {
    var _this = this;

    var activeIndex = config.activeIndex;
    var stepNames = config.steps;

    function emitBeforeChange() {
        var cancelled = false;

        _this.emit('beforeChange', {
            step: stepNames[activeIndex],
            preventDefault: function() {
                cancelled = true;
            }
        });

        return {
            cancelled: cancelled
        };
    }

    function setCurrentStepIndex(index) {
        if (activeIndex === index) {
            return;
        }

        if (emitBeforeChange().cancelled) {
            return;
        }

        $(_this.getEl('step' + activeIndex)).removeClass('active');

        activeIndex = index;

        var name = stepNames[activeIndex];

        $(_this.getEl('step' + index)).addClass('active');

        _this.emit('change', {
            name: name,
            index: index
        });
    }

    this.$().on('click', '[data-progress-step-index]', function(e) {
        e.preventDefault();
        var index = parseInt(this.getAttribute('data-progress-step-index'), 10);
        setCurrentStepIndex(index);
    });

    this.setCurrentStepIndex = setCurrentStepIndex;
}

exports.Widget = Widget;