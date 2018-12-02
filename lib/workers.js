var _log = require('./log');


workers = {};
workers.init = function() {

    workers.loop();
    workers.logToConsole();
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
        workers.getRandom(6) 
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
    workers.log('1234', "google.com", startTime, endTime - startTime);
    workers.log('1235', "facebook.com", startTime, endTime - startTime);
    workers.log('1236', "amazon.com", startTime, endTime - startTime);
}

module.exports = workers;