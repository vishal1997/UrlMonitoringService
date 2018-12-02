var Tail = require('tail').Tail;
var monitorUrlDao = require('../dao/monitorUrlDao');
var path = require('path');
var applicationLog = require('./application.log');
var addLatencyList = {};
addLatencyList.baseDir = path.join(__dirname, '/../.log/');

/**
 * @param file: Name of the service log file.
 * @param callback: If error occuured then send the error in callback argument
 * 
 * Reads service log file whenever it gets updated and 
 * call the monitorUrlDao to update the latency list of 
 * the url in the is the database 
 */
addLatencyList.readFile = function(file, callback) {
    tail = new Tail(addLatencyList.baseDir+file);
    tail.on("line", function(data) {
        var res = JSON.parse(data);
        res = {
            '_id' : res._id,
            'latencyList' : res.latencyList
        }
        monitorUrlDao.addLatencyDetailsToLatencyList(res, function(res) {
        });
    });

    tail.on("error", function(error) {
        applicationLog.log('ERROR: ', error);
    });

 };

 /**
  * Export the module
  */
 module.exports = addLatencyList;