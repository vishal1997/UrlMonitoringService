var server = require('./lib/server');
var workers = require('./lib/workers');

var app = {};

app.init = function() {
    //Start server
    server.init();

    //Start the workers
    workers.init();
};

app.init();

module.exports = app;