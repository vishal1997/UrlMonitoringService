/**
 * Library for storing and rotating logs
 */

 var fs = require('fs');
 var path = require('path');
 var Tail = require('tail').Tail;
 var dao = require('../dao/dao');
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
    //dao.addDataToUrlModel("");
    tail = new Tail(lib.baseDir+file);
    tail.on("line", function(data) {
        //console.log(data);
        /**
         * id : url (data)
         * id : (timestamp, latency)
         * id, url, [{timestamp: ts1, latency: l1}, {timestamp: ts2, latency: l1}]
         */
        var res = JSON.parse(data);
        // TODO: Save result in database & TODO item to optimize it.
        //console.log(res);
        res = {
            'id' : res.id,
            'latencyList' : res.latencyList
        }
        //dao.addDataToUrlModel()
    });

    tail.on("error", function(error) {
        console.log('ERROR: ', error);
    });

 };

 module.exports = lib;