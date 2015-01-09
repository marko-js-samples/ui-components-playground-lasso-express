module.exports = function(app) {
    app.get('/', require('./src/pages/home'));
};