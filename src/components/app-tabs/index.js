module.exports = require('marko-widgets').defineWidget({
    template: require.resolve('./template.marko'),


    getInitialProps: function(input) {
        var tabs = [];
        var activeIndex = -1;


        function addTab(tab) {
            if (tab.active) {
                activeIndex = tabs.length;
            }

            tabs.push(tab);
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
                    visible: tab.visible !== false,
                    id: tab.id
                };
            })
        };
    },

    getTemplateData: function(state, input) {
        var activeIndex = state.activeIndex;

        // If this is a rerender then we only have access
        // to the state which includes the "lightweight" tabs
        // (without the nested body content). However, if this
        // is not a rerender then we have access to the input
        // props which include the complete tabs.
        var tabs = input ? input.tabs : state.tabs;

        return {
            tabs: tabs.map(function(tab, i) {
                // Build a view model for our tab that will
                // simplify how the tab is rendered
                return {
                    isActive: activeIndex === i,
                    id: tab.id,
                    visible: tab.visible,
                    label: tab.label,
                    body: tab.renderBody,
                    index: i
                };
            })
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