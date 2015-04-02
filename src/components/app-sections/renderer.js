var template = require('marko').load(require.resolve('./template.marko'));

exports.renderer = function(input, out) {

    var sections = [];

    input.getSections({
        addSection: function(section) {
            sections.push({
                renderBody: section.renderBody,
                title: section.title,
                anchorName: section.title.replace(/[^a-zA-Z]+/g, '-')
            });
        }
    });
    template.render({
        sections: sections
    }, out);
};