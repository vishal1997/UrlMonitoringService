var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var UrlMonitor = require('../model/UrlMonitor');

var monitorUrlDao = {};

const limit = 100;

monitorUrlDao.addUrlData = function(id, callback) {
    var newMonitor = new UrlMonitor( {
        _id : id,
        latencyList : []
    })
    newMonitor.save(function(err) {
        if(!err) {
            callback(false);
        } else {
            callback(true);
        }
    })
}

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

monitorUrlDao.deleteUrl = function(urlId, callback) {
    UrlMonitor.find({'_id': urlId}).deleteOne().exec(function(err) {
        if(!err) {
            callback({'success' : true});
        } else {
            callback({'success' : false});
        }
    });
} 

monitorUrlDao.addLatencyDetailsToLatencyList = function(data, callback) {
    UrlMonitor.findOneAndUpdate({'_id' : data._id}, 
                                {$push :{latencyList: data.latencyList}},
                                function(err,res) {
        if(!err && res) {
            callback({'res' : "Successfully added data to latencyList"});
        } else {
            callback({'error' : "Error adding data to latencyList"});
        }
    });
}
module.exports = monitorUrlDao;