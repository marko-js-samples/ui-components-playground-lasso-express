module.exports = require('marko-widgets').defineComponent({
    template: require.resolve('./template.marko'),

    getInitialState: function(input) {

        var steps = [];
        var activeIndex = -1;

        function addStep(step) {
            if (step.active) {
                activeIndex = steps.length;
            }

            steps.push({
                label: step.label,
                name: step.name
            });
        }

        if (input.steps) {
            input.steps.forEach(addStep);
        }

        if (activeIndex === -1) {
            activeIndex = 0;
        }

        input.steps = steps;

        return {
            activeIndex: activeIndex,
            steps: steps
        };
    },

    getTemplateData: function(state, input) {
        return {
            activeIndex: state.activeIndex,
            steps: state.steps
        };
    },

    setCurrentStepIndex: function(index) {
        if (this.state.activeIndex === index) {
            return;
        }

        var defaultPrevented = false;

        this.emit('beforeChange', {
            step: this.state.steps[this.state.activeIndex],
            preventDefault: function() {
                defaultPrevented = true;
            }
        });

        if (defaultPrevented) {
            return;
        }

        var newStep = this.state.steps[index];

        this.setState('activeIndex', index);

        this.emit('change', {
            name: newStep.name,
            index: index
        });
    },

    handleStepClick: function(event, el) {
        event.preventDefault();
        var index = parseInt(el.getAttribute('data-progress-step-index'), 10);
        this.setCurrentStepIndex(index);
    }
});