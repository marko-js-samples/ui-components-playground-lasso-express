var notificationHeight = 48;

function Widget() {
    var top = -48;
    var _this = this;

    var el = this.el;
    this.moveDown = function() {
        top += notificationHeight;
        setTimeout(function() {
            el.style.top = top + 'px';
        }, 10);
    };

    this.remove = function() {
        el.style.opacity = 0;
        setTimeout(function() {
            _this.destroy();
        }, 300);
    };
}

module.exports = Widget;