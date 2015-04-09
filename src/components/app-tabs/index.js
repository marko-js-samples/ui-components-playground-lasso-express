module.exports = require('marko-widgets').defineWidget({
    template: require.resolve('./template.marko'),

    getInitialProps: function(input) {
        var tabs = [];
        var activeIndex = -1;


        function addTab(tab) {
            if (tab.active) {
                activeIndex = tabs.length;
            }

            tabs.push({
                label: tab.label,
                renderBody: tab.renderBody
            });
        }

        if (input.tabs) {
            input.tabs.forEach(addTab);
        } else if (input.getTabs) {
            // Invoke the body function to discover nested <app-tab> tags
            input.getTabs({ // Invoke the body with the scoped "__tabsHelper" variable
                addTab: addTab
            });
        }

        if (activeIndex === -1) {
            activeIndex = 0;
        }

        input.tabs = tabs;

        return {
            activeIndex: activeIndex,
            tabs: tabs
        };
    },

    getInitialState: function(input) {
        return {
            activeIndex: input.activeIndex,
            tabs: input.tabs.map(function(tab) {
                return {
                    label: tab.label
                };
            })
        };
    },

    getTemplateData: function(state, input) {
        var tabs = state.tabs;

        // NOTE: Input will be null if this is a re-render
        //       and we will only have access to the persisted
        //       state. If this is the first render then
        //       we have the content for the tab panes.
        //
        if (input && input.tabs) {
            tabs = input.tabs;
        }

        return {
            tabs: tabs,
            activeIndex: state.activeIndex
        };
    },

    setActiveIndex: function(newActiveIndex) {
        this.setState('activeIndex', newActiveIndex);
    },

    handleTabClick: function(event, el) {
        var newActiveIndex = parseInt(el.getAttribute('data-tab-index'), 10);
        this.setActiveIndex(newActiveIndex);
        event.preventDefault();
    }
});