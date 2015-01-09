require('app-module-path').addPath(__dirname);

var express = require('express');
var compression = require('compression');
var serveStatic = require('serve-static');

require('marko/browser-refresh').enable();
require('optimizer/browser-refresh').enable('*.marko *.css *.less');

require('optimizer').configure({
    plugins: [
        'optimizer-less',
        'optimizer-marko'
    ],
    outputDir: __dirname + '/static'
});

var app = express();

var port = 8080;

app.use(compression()); // Enable gzip compression for all HTTP responses
app.use('/static', serveStatic(__dirname + '/static'));

require('./routes')(app);

app.listen(port, function() {
    console.log('Listening on port %d', port);

    if (process.send) {
        process.send('online');
    }
});