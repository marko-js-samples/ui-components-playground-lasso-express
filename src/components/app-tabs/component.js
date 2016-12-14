require('./style.less');

module.exports = {
    onInput: function(input) {
        var activeIndex = 0;

        var tabs = input.tabs;

        tabs.forEach(function(tab, i) {
            if (tab.active) {
                activeIndex = i;
            }
        });

        this.state = {
            activeIndex: activeIndex,
            tabs: tabs
        };
    },

    setActiveIndex: function(newActiveIndex) {
        this.state.activeIndex = newActiveIndex;
    },

    handleTabClick: function(tabIndex, event) {
        this.setActiveIndex(tabIndex);
        event.preventDefault();
    }
};