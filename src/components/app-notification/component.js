require('./style.less');

module.exports = {
    onInput: function(input) {
        this.state = {
            timeout: input.timeout,
            message: input.message
        };
    },

    onMount: function() {
        var el = this.el;
        setTimeout(function() {
            el.style.opacity = 1;
            el.style.maxHeight = '60px';
        }, 10);
    },

    fadeOut: function(callback) {
        var el = this.el;
        el.style.opacity = 0;
        setTimeout(callback, 300);
    }
};