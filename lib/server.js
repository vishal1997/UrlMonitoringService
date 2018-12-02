var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('../config/config');
var fs = require('fs');
var handler = require('./handler');
var applicationLog = require('./application.log');
var path = require('path');
var mongoose = require('../model/mongoose');
var server= {};

//Instatiating the http server
server.httpServer = http.createServer(function(req, res) {
    server.unifiedServer(req, res);
});

// Start the server


// Instantiate the HTTS server
server.httpsServerOptions = {
    'key' : fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem')),
};
server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res) {
    server.unifiedServer(req, res);
});

// All the server logic for both http and https server

server.unifiedServer = function(req,res) {
    var parsedUrl = url.parse(req.url, true);
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');
    var method = req.method.toLowerCase();
    var queryStringObject = parsedUrl.query;
    var header = req.headers;
    var buffer = '';
    var decoder = new StringDecoder('utf-8');

    req.on('data', function(data) {
        buffer  += decoder.write(data);
    });

    req.on('end', function(end) {

        buffer += decoder.end();
        var choosenHandler = server.router['/'];
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : header,
            'payloads' : buffer
        };

        choosenHandler(data, function(statusCode, payload) {
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};
            var payloadString = JSON.stringify(payload);
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            applicationLog.log("Responding: "+statusCode+" " +payloadString);
        });
    });

};

server.router = {
    '/' : handler.url
};

/**
 * Connect to the Dababase server and start listening https and http request
 */
server.init = function() {
    mongoose.connect();
    server.httpServer.listen(config.httpPort, function() {
        applicationLog.log("Listening to server on port "+ config.httpPort+' in ' + config.envName + ' now');
        console.log("Listening to server on port "+ config.httpPort+' in ' + config.envName + ' now');
    });

    server.httpsServer.listen(config.httpsPort, function() {
        applicationLog.log("Listening to server on port "+ config.httpsPort+' in ' + config.envName + ' now');
        console.log("Listening to server on port "+ config.httpsPort+' in ' + config.envName + ' now');
    });
}

/**
 * Export the module
 */
module.exports = server;


