var _log = require('./log');
var urlDao = require('../dao/urlDao');
var applicatonLog = require('./application.log');
var addLatencyList = require('./addLatencyList');
var url = require('url');
var https = require('https');
var async = require('async');
const httpRequest = 'https';
const fileName = "service.log";

var workers = {};
var monitoredUrls = "";
workers.init = function() {
    /**
     * Listen to database changes.
     * As soon as there is a database change, read the database list for the url.
     * (From this the user will learn about publisher - subscriber model (PubSub model))
     * 
     * Once the list is there.
     * 1. Call every URL every 1 second, store the timestamp, latency, id in the service_log
     */

    applicatonLog.log("Monitoring service started");

    urlDao.getAllMonitoredUrl(function(urlList) {
        if (urlList) {
            monitoredUrls = urlList;
        }
    })

    workers.monitor();
    workers.loop();
    workers.parseLog();
}
/**
 * Monitors all the url
 */
workers.monitor = function() {
    workers.monitorEveryUrl(monitoredUrls);
}

/**
 * Async calls to https to get the response time
 */

workers.monitorEveryUrl = function(monitoredUrls) {
    async.map(monitoredUrls, function(url) {
        workers.httpRequest(url);
    }); 
}

/**
 * Create request details object and make https call to monitor the response time
 */
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

    req.on('error',function(err){
        applicatonLog.log("Error while monitoring url: " +parsedUrl + ", error: "+err);
    });


    req.on('timeout',function(){
        applicatonLog.log("Request timeout for url: " +parsedUrl);  
    });

    req.end();
}

/**
 * @param id: Id of the url
 * @param url: Url path
 * @param startTime: timestamp of the https request made
 * @param latency: response time of the https request
 * 
 * Create log data object and append the object to the service log file
 */
workers.log = function(id, url, startTime, latency) {
    var logData = {
        '_id': id,
        'url' : url,
        'latencyList': [{
            'timestamp' : startTime,
            'latency' : latency,
        }]
    }

    var logString = JSON.stringify(logData);
    _log.append(fileName, logString, function (err) {
        if(!err) {
            
        } else {
            applicatonLog.log('Error updating service log file');
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
    addLatencyList.readFile(fileName, function(err, data) {
        if(!err && data) {
            applicatonLog.log('Data successfully read from service log');
        } else {
            applicatonLog.log('error while reading log file:' + fileName);
        }
    })
}
module.exports = workers;