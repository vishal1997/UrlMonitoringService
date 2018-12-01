var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var Url = require('../model/Url');
var UrlMonitor = require('../model/UrlMonitor');

var dao = {};

dao.getAllMonitoredUrl = function() {
    Url.find({}, function(err, data) {
        if(!err) {
            return data;
        } else {
            console.log('Error while getting url details');
        }
    })
}

dao.getUrlDetailsById = function(id) {
    UrlMonitor.findOne({'id' : id}, function(err, data) {
        if(!err) {
            return data.latencyList;
        } else {
            console.log('Error while geting latencyList of ', id);
        }
    })
}

dao.addDataToUrlModel = function(data) {
    
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

            urlMonitor = new UrlMonitor({
                'id' : newUrl.id,
                'url' : newUrl.url,
                'latencyList' : []
            })

            urlMonitor.save(function(err) {
                if(!err) {
                    return newUrl.id;
                } else {
                    return newUrl.id;
                }
            })
        } else {
            console.log("Url already exist");
            return "Url already monitored";
        }
    });
}

dao.deleteUrl = function(urlId) {
    console.log(urlId);
    Url.find({'id': urlId}).deleteOne().exec();
}

dao.updateUrlData = function(id, updatedData) {
    Url.findOneAndUpdate(id, {
        'url' : updatedData.url,
        'data' : updatedData.data
    }, function(err, data){
        if(!err) {
            return {'data updated ' : updatedData};
        } else {
            console.log('error updating the url details for id ' ,id);
        }
    })
}

dao.addLatencyDetailsToLatencyList = function(data) {
    UrlMonitor.findOneAndUpdate({'id' : data.id}, 
                                {$push :{latencyList: data.latencyList}},
                                function(err,succ) {
        if(!err) {
            console.log("Successfully added data to latencyList");
        } else {
            console.log("Error adding data to latencyList");
        }
    });
}

module.exports = dao;