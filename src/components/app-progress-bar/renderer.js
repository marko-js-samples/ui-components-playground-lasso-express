var template = require('marko').load(require.resolve('./template.marko'));

function Step(step) {
    this.renderBody = step.renderBody;
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

// Export a render(input) method that can be used
// to render this UI component on the client
exports.render = function(input, out) {
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
    } else if (input.getSteps) {
        steps = [];

        // Invoke the body function to discover nested <app-progress-bar-step> tags
        input.getSteps({ // Invoke the body with the scoped "__progressBar" variable
            addStep: function(step) {
                step = new Step(step);
                step.index = steps.length;

                if (step.active) {
                    activeIndex = step.index;
                }

                steps.push(step);
            }
        });
    } else {
        steps = [];
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

