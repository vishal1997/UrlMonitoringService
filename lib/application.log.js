var log = require('./log');
var applicationLog = {};

/**
 * @param logString: String that is to be added to application log file
 * 
 * Add logs to the application log file.
 * It generates current date file and then appends all the log for the same date.
 * If the date changes then generates file with the new date.
 * Maintains the application log file by the date. 
 */
applicationLog.log = function(logString) {
    var date = new Date();
    var fileName = date.getDate()+'-'+date.getMonth()+'-'+date.getFullYear()+'.application.log';
    log.append(fileName, logString, function(err) {
        if(err) {
            console.log("Error writing application log to file ", fileName );
        }
    })
}

/**
 * Export the module
 */
module.exports = applicationLog;