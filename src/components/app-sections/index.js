require('./style.less');

module.exports = require('marko-widgets').defineComponent({
    template: require('./template.marko'),

    getTemplateData: function(state, input) {
        var sections = input.sections || [];

        // Add an anchorName property based on the title
        sections.forEach(function(section) {
            section.anchorName = section.title.replace(/[^a-zA-Z]+/g, '-');
        });

        return {
            sections: sections
        };
    }
});