var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var Url = require('../model/Url');
var UrlMonitor = require('../model/UrlMonitor');

var dao = {};

dao.getAllMonitoredUrl = function(callback) {
    Url.find({}, function(err, data) {
        if(!err) {
            callback(200, data);
        } else {
            callback(200, {'res' :'No data found'});
        }
    })
}

dao.getUrlDetailsById = function(id, callback) {
    UrlMonitor.findOne({'id' : id}, function(err, data) {
        if(!err) {
            callback(200, data.latencyList);
        } else {
            callback(200, {"Error" : "No data found"});
        }
    })
}

dao.addDataToUrlModel = function(data, callback) {
    
    newUrl = new Url({
        id : data.id,
        url : data.url,
        method : data.post,
        data : data.query,
        headers : data.headers,
    })

    newUrl.save(function(err) {
        if(!err) {
            console.log("new url added to db");
            callback(200, {"id": newUrl.id});
        } else {
            callback(500, {'info': "Unable to save url in the database"});
        }
    });
}

dao.deleteUrl = function(urlId, callback) {

    Url.find({'id': urlId}).deleteOne().exec(function(err) {
        if(!err) {
            callback(200, {'success' : true});
        } else {
            callback(500, {'sucess' : false});
        }
    });
}

dao.updateUrlData = function(id, updatedData, callback) {

    Url.findOneAndUpdate(id, {$set:{
        'url' : updatedData.url,
        'data' : updatedData.data
    }},{new : true}, function(err, data){
        if(!err) {
            callback(200, {'id ' : id});
        } else {
            callback(500, {'erro ' : 'error updating the url details for id '+id});
        }
    })
}

dao.addLatencyDetailsToLatencyList = function(data, callback) {
    UrlMonitor.findOneAndUpdate({'id' : '9ew2v5kpnn'}, 
                                {$push :{latencyList: data.latencyList}},
                                function(err,succ) {
        if(!err) {
            callback({'res' : "Successfully added data to latencyList"});
        } else {
            callback({'res' : "Error adding data to latencyList"});
        }
    });
}

module.exports = dao;