var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var Url = require('../model/Url');

var urlDao = {}

urlDao.getAllMonitoredUrl = function(callback) {
    Url.find({}, function(err, data) {
        if(!err) {
            callback(data);
        } else {
            callback(false);
        }
    })
}

urlDao.deleteUrl = function(urlId, callback) {

    Url.find({'_id': urlId}).deleteOne().exec(function(err) {
        if(!err) {
            callback(200, {'success' : true});
        } else {
            callback(500, {'success' : false});
        }
    });
}

urlDao.getUrlInfoById = function(id, callback) {
    Url.findOne({'_id':id}, function(err, res) {
        if(!err && res) {
            callback(res);
        } else {
            callback(false);
        }
    });
}

urlDao.updateUrlData = function(id, updatedData, callback) {

    Url.findOneAndUpdate(id, {$set:{
        'url' : updatedData.url,
        'data' : updatedData.data
    }},{new : true}, function(err, data){
        if(!err) {
            callback({'_id ' : id});
        } else {
            callback(false);
        }
    })
}

urlDao.addDataToUrlModel = function(data, callback) {
    
    newUrl = new Url({
        _id : data._id,
        url : data.url,
        method : data.method,
        data : data.data,
        headers : data.headers,
    })

    newUrl.save(function(err) {
        if(!err) {
            console.log("new url added to db");
            callback({"_id": newUrl._id});        
        } else {
            callback(false);
        }
    });
}

module.exports = urlDao;