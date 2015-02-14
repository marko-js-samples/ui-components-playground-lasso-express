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

