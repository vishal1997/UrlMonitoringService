/**
 * Library for storing and rotating logs
 */
 var fs = require('fs');
 var path = require('path');
 var Tail = require('tail').Tail;
 var monitorUrlDao = require('../dao/monitorUrlDao');
 var lib = {};

 lib.baseDir = path.join(__dirname, '/../.log/');

 lib.append = function (file, str, callback) {

    fs.open(lib.baseDir+file,'a', function(err, fileDescriptor) {
        if(!err && fileDescriptor) {
            fs.appendFile(fileDescriptor, str+'\n', function(err) {
                if(!err) {
                    fs.close(fileDescriptor, function(err) {
                        if(!err) {
                            callback(false);
                        } else {
                            callback('Error closing file');
                        }
                    })
                } else {
                    callback('Error appending to file');
                }
            });
        } else {
            callback('Could not open file for eppending');
        }
    })
 }

 lib.readFile = function(file, callback) {
    tail = new Tail(lib.baseDir+file);
    tail.on("line", function(data) {
        var res = JSON.parse(data);
        res = {
            '_id' : res._id,
            'latencyList' : res.latencyList
        }
        monitorUrlDao.addLatencyDetailsToLatencyList(res, function(res) {
            //TODO
        });
    });

    tail.on("error", function(error) {
        console.log('ERROR: ', error);
    });

 };

 module.exports = lib;