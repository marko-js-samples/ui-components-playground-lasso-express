function Widget() {
    var _this = this;

    this.$().click(function(e) {
        _this.emit('click', {
            event: e
        });
    });
}

Widget.prototype = {

};

module.exports = Widget;