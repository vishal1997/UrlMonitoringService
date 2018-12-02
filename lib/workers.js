var _log = require('./log');
var urlDao = require('../dao/urlDao');
var url = require('url');
var https = require('https');
var async = require('async');
const httpRequest = 'https';
const fileName = "service.log";

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
    workers.parseLog();
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
        workers.httpRequest(url);
    }); 
}

workers.httpRequest = function(urlObject) {

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
            var endTime = Date.now();
            workers.log(urlObject._id,urlObject.url,startTime, endTime - startTime);
            outcomeSent = true;
        }
    });

    req.on('error',function(e){
        //TODO
    });


    req.on('timeout',function(){
        //TODO   
    });

    req.end();
}

workers.log = function(id, url, startTime, endTime) {
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
            //TODO: console.log('Log file updated for ' + fileName);
        } else {
            //TODO :console.log('Error updating log file');
        }
    });
}

workers.loop = function() {
    setInterval(function() {
        workers.monitor();
    }, 1000)
}

workers.parseLog = function() {
    workers.saveLogToDb();
}

workers.saveLogToDb = function() {
    var fileName = "service.log"
    _log.readFile(fileName, function(err, data) {
        if(!err && data) {
            //TODO
        } else {
            //TODO console.log('error while reading log file:' + fileName);
        }
    })
}
module.exports = workers;