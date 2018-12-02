var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var UrlMonitor = require('../model/UrlMonitor');
var applicationLog = require('../lib/application.log');
var monitorUrlDao = {};

const limit = 100;

/**
 * @param id: Generated id of the new url entry
 * @param callback: callback function accepts the response 
 * 
 * Adds new Url entry to the MonitorUrl collection. 
 * Response with false if no error occurred while adding data to Db, otherwise true.
 */
monitorUrlDao.addUrlData = function(id, callback) {
    var newMonitor = new UrlMonitor( {
        _id : id,
        latencyList : []
    })
    newMonitor.save(function(err) {
        if(!err) {
            applicationLog.log("POST (MonitorUrl) - Url added for id: "+ id);
            callback(false);
        } else {
            applicationLog.log("POST (MonitorUrl) - Error while adding url to MonitorUrlModel for id: "+ id);
            callback(true);
        }
    })
}

/**
 * @param id: urlId ,
 * @param callback: callback function accepts response as the argument
 * 
 * Get the latency list of the given url Id. 
 * If the entry for the given id is not found then false is sent in response.
 */
monitorUrlDao.getUrlDetailsById = function(id, callback) {
    UrlMonitor.aggregate([
        {
            "$match" : {
                '_id' : id
            }
        }, {
            "$unwind" : "$latencyList"
        }, {
            "$sort" : {
                "latencyList.timestamp" : -1
            }
        }, {
            "$limit" : limit
        }, {
            "$group" : {
                "responses" : {
                    "$push" : "$latencyList.latency"
                },
                '_id' : id
            }
        } , {
            "$project" : {
                '_id' : 1,
                "responses" : 1,
            }
        }   
    ], function(err, res) {
        if (!err && res && res.length !== 0) {
            let response = res[0];
            callback(response);
        } else {
            callback(false)
        }
    });
}

/**
 * @param urlId: url id of the entry that is to be deleted
 * @param callback: callback function accepts response in the argument.
 *  
 * The method deletes the entry if Id is found int the collection.
 * Sends reponse as true if delete is successfull otherwise false 
 */
monitorUrlDao.deleteUrl = function(urlId, callback) {
    UrlMonitor.find({'_id': urlId}).deleteOne().exec(function(err) {
        if(!err) {
            applicationLog.log("DELETE (MonitorUrlModel): Delete successful for id: "+urlId);
            callback({'success' : true});
        } else {
            applicationLog.log("DELETE (MonitorUrlModel): Delete unsuccessful for id: "+urlId);
            callback({'success' : false});
        }
    });
} 

/**
 * @param data: Data contains the id and list of latency that is to be appended in the database
 * @param callback: callback function accepts response in the argument.
 * 
 * Append the latency list in the url entry.
 */
monitorUrlDao.addLatencyDetailsToLatencyList = function(data, callback) {
    UrlMonitor.findOneAndUpdate({'_id' : data._id}, 
                                {$push :{latencyList: data.latencyList}},
                                function(err,res) {
        if(!err && res) {
            applicationLog.log("Update latencyList (MonitorUrlModel): upadte successful for id: "+data._id);
            callback({'res' : "Successfully added data to latencyList"});
        } else {
            applicationLog.log("Update latencyList (MonitorUrlModel): upadte unsuccessful for id: "+data._id+ " err"+ err);
            callback({'error' : "Error adding data to latencyList"});
        }
    });
}
/**
 * Export the module
 */
module.exports = monitorUrlDao;