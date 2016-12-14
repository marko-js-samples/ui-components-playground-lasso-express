require('./style.less');

module.exports = {
    onInput: function(input) {
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

        this.state = state;
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

    handleStepClick: function(stepIndex, event) {
        event.preventDefault();
        this.setCurrentStepIndex(stepIndex);
    }
};