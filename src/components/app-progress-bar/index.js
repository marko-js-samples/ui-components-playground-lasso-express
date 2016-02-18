require('./style.less');

module.exports = require('marko-widgets').defineComponent({
    template: require('./template.marko'),

    getInitialState: function(input) {
        var steps = input.steps || [];
        var activeIndex = -1;

        var state = {
            steps: input.steps.map(function(step) {
                if (step.active) {
                    activeIndex = steps.length;
                }

                return {
                    name: step.name
                };
            })
        };

        if (activeIndex === -1) {
            activeIndex = 0;
        }

        state.activeIndex = activeIndex;

        return state;
    },

    getTemplateData: function(state, input) {
        var activeIndex = state.activeIndex;

        // If this is a rerender then we only have access
        // to the state which includes the steps without
        // (without the nested body content). However, if this
        // is not a rerender then we have access to the input
        // props which include the complete tabs.
        var steps = state.steps;

        return {
            steps: steps.map(function(tab, i) {
                var body;

                if (input) {
                    var inputStep = input.steps[i];
                    body = inputStep.renderBody || inputStep.label;
                }

                // Build a view model for our tab that will
                // simplify how the tab is rendered
                return {
                    isActive: activeIndex === i,
                    body: body,
                    index: i
                };
            })
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