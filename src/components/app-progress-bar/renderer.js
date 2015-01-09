var template = require('marko').load(require.resolve('./template.marko'));

function Step(step) {
    this._step = step;
    this.invokeBody = step.invokeBody;
    this.label = step.label;
    this.isFirst = false;
    this.isLast = false;
    this.active = step.active;
    this.index = null;
}

Step.prototype = {
    getClassNames: function() {
        var step = this._step;
        var completed = step.completed === true;
        var classNames = ['progress-step'];
        if (completed) {
            classNames.push('completed');
        }

        if (this.active) {
            classNames.push('active');
        }

        return classNames.join(' ');

    }
};

module.exports = function render(data, out) {
    var steps = [];

    var activeIndex = -1;

    // Invoke the body function to discover nested <ui-step> tags
    data.invokeBody({ // Invoke the body with the scoped "steps" variable
        addStep: function(step) {


            step = new Step(step);
            step.index = steps.length;

            if (step.active) {
                activeIndex = step.index;
            }

            step.label = step.label || step.index;
            steps.push(step);
        }
    });

    if (activeIndex === -1) {
        activeIndex = 0;
    }

    if (steps.length) {
        steps[0].isFirst = true;
        steps[steps.length-1].isLast = true;
        steps[activeIndex].active = true;
    }


    // Now render the markup for the steps:
    template.render({
            widgetConfig: {
                activeIndex: activeIndex,
                steps: steps.map(function(step) {
                    return step.label;
                })
            },
            steps: steps
        }, out);
};

