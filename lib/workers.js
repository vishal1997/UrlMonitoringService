var _log = require('./log');
var urlDao = require('../dao/urlDao');
var url = require('url');
var https = require('https');
var async = require('async');
const httpRequest = 'https';

workers = {};
workers.init = function() {
    /**
     * Listen to database changes.
     * As soon as there is a database change, read the database list for the url.
     * (From this the user will learn about publisher - subscriber model (PubSub model))
     * 
     * Once the list is there.
     * 1. Call every URL every 1 second, store the timestamp, latency, id in the service_log
     */
    workers.monitor();
    workers.loop();
    workers.logToConsole();
}

workers.monitor = function() {
    urlDao.getAllMonitoredUrl(function(monitoredUrls) {
        if (monitoredUrls) {
            workers.monitorEveryUrl(monitoredUrls);
        }
    })
}

workers.monitorEveryUrl = function(monitoredUrls) {
    async.map(monitoredUrls, function(url) {
        console.log("StartTime:" , Date.now());
        workers.httpRequest(url);
    }); 
}

workers.httpRequest = function(urlObject) {
    // Mark that the outcome has not been sent yet
    var outcomeSent = false;

    var parsedUrl = url.parse(httpRequest+'://'+urlObject.url, true);
    var hostName = parsedUrl.hostname;
    var path = parsedUrl.path;

    var requestDetails = {
        'protocol' : httpRequest+':',
        'hostname' : hostName,
        'method' : urlObject.method.toUpperCase(),
        'path' : path
    };
    
    var startTime = Date.now();
    var req = https.request(requestDetails,function(res){
        if(!outcomeSent){
            workers.log(urlObject._id,urlObject.url,startTime, Date.now() - startTime);
            outcomeSent = true;
        }
    });

    req.on('error',function(e){
        console.log(e);
    });


    req.on('timeout',function(){
        console.log("timeout");    
    });

    req.end();
}

workers.log = function(id, url, startTime, endTime) {
    let fileName = "service.log";
    var logData = {
        '_id': id,
        'url' : url,
        'latencyList': [{
            'timestamp' : startTime,
            'latency' : endTime,
        }]
    }

    var logString = JSON.stringify(logData);
    _log.append(fileName, logString, function (err) {
        if(!err) {
            console.log('Log file updated for ' + fileName);
        } else {
            console.log('Error updating log file');
        }
    });
}

workers.loop = function() {
    setInterval(function() {
        workers.monitor();
    }, 1000)
}

workers.parseLog = function() {
    workers.logToConsole();
}

workers.logToConsole = function() {
    var fileName = "service.log"
    _log.readFile(fileName, function(err, data) {
        if(!err && data) {
            //console.log(data);
        } else {
            console.log('error while reading log file:' + fileName);
        }
    })
}

workers.getRandom = function(x) {
    startTime = Date.now();
    for (var i=0; i< 10000; i++)
    randomNumber = Math.random() * (x+100000000 - 1) + 1;
    endTime = Date.now();
    //workers.log('1234', "google.com", startTime, endTime - startTime);
    //workers.log('1235', "facebook.com", startTime, endTime - startTime);
    //workers.log('1236', "amazon.com", startTime, endTime - startTime);
}

module.exports = workers;