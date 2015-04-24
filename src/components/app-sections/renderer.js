var template = require('marko').load(require.resolve('./template.marko'));

exports.renderer = function(input, out) {

    var sections = input.sections;

    // Add an anchorName property based on the title
    sections.forEach(function(section) {
        section.anchorName = section.title.replace(/[^a-zA-Z]+/g, '-');
    });

    template.render({
        sections: sections
    }, out);
};