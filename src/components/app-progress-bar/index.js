var template = require('marko').load(require.resolve('./template.marko'));

function Step(step) {
    this.invokeBody = step.invokeBody;
    this.label = step.label;
    this.active = step.active;
    this.index = step.name;
    this.name = step.name || step.index;
}

Step.prototype = {
    getClassNames: function() {
        var classNames = ['progress-step'];

        if (this.active) {
            classNames.push('active');
        }

        return classNames.join(' ');
    }
};

exports.renderer = function(input, out) {
    var steps = input.steps;

    var activeIndex = -1;

    if (steps) {
        steps = steps.map(function(step, i) {
            step = new Step(step);
            step.index = i;
            if (step.active) {
                activeIndex = i;
            }
            step.active = false;
            return step;
        });
    } else {
        steps = [];

        // Invoke the body function to discover nested <app-progress-bar-step> tags
        input.invokeBody({ // Invoke the body with the scoped "__progressBar" variable
            addStep: function(step) {
                step = new Step(step);
                step.index = steps.length;

                if (step.active) {
                    activeIndex = step.index;
                }

                steps.push(step);
            }
        });
    }



    if (activeIndex === -1) {
        activeIndex = 0;
    }

    if (steps.length) {
        steps[activeIndex].active = true;
    }

    // Now render the markup for the steps:
    template.render({
            widgetConfig: {
                activeIndex: activeIndex,
                steps: steps.map(function(step) { // Pass an array of the step names to the widget
                    return step.label;
                })
            },
            steps: steps
        }, out);
};

// Export a render(input) method that can be used
// to render this UI component on the client
exports.render = require('marko-widgets').renderFunc(exports.renderer);

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