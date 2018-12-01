/**
 * Library for storing and rotating logs
 */

 var fs = require('fs');
 var path = require('path');
 var zlib = require('zlib');
 var Tail = require('tail').Tail;

 var lib = {};

 lib.baseDir = path.join(__dirname, '/../.log/');

 lib.append = function (file, str, callback) {

    fs.open(lib.baseDir+file+'.service.log','a', function(err, fileDescriptor) {
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
    let readStream =  fs.createReadStream(lib.baseDir+file+'.service.log', 'utf-8');
    let chunks = [];
    readStream.on('error', function(err) {

    });
    readStream.on('data', function(chunk) {
        console.log("read stream")
        console.log(chunk);
        chunks.push(chunk);
    })
    readStream.on('close', function() {
    })
 };

 module.exports = lib;