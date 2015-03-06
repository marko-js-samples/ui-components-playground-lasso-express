var template = require('marko').load(require.resolve('./template.marko'));

module.exports = function(req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    var checked = {
        foo: false,
        bar: true,
        baz: false
    };

    var checkedList = Object.keys(checked).filter(function(k) {
        return checked[k] === true;
    });

    var viewModel = {
        checkedList: checkedList,
        checked: checked,
        widgetState: {
            checked: checked
        }
    };
    template.render(viewModel, res);
};