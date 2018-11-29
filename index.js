var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var handler = require('./lib/handler');
//Instatiating the http server
var httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});

// Start the server
httpServer.listen(config.httpPort, function() {
    console.log("Listening to server on port"+ config.httpPort+' in ' + config.envName + ' now');
});

// Instantiate the HTTS server
var httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req, res) {

    unifiedServer(req, res);
});
//Start the HTTPS server
httpsServer.listen(config.httpsPort, function() {
    console.log("Listening to server on port"+ config.httpsPort+' in ' + config.envName + ' now');
});
// All the server logic for both http and https server

var unifiedServer = function(req,res) {
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

        var choosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handler.notFound;

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
            console.log("Responding: ", statusCode, payloadString);
        });

        
        //console.log("\nRequest rec. with payload ", buffer);
        //console.log("\nPath requested: "+ trimmedPath+" with method "+ method + " with query ",queryStringObject);
        //console.log("\nRequest rec with headers ", header);
    });

};

var router = {
    'ping' : handler.ping,
    'url' : handler.url
};


