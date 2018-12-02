/**
 * Library for storing and rotating logs
 */
 var fs = require('fs');
 var path = require('path');
 var lib = {};

 lib.baseDir = path.join(__dirname, '/../.log/');
/**
 * @param file: Name of the log file
 * @param str: String that contains the log
 * Write logs to the log file
 */
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

 /**
  * Export the module
  */
 module.exports = lib;