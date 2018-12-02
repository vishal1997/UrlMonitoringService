var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var Url = require('../model/Url');
var applicationLog = require('../lib/application.log');
var urlDao = {}


/**
 * @param callback: callback function accepts response as argument
 * 
 * Get all the url entry with all its details.
 * If no data found then false is sent as the agrument of callback function else
 * the data are sent as argument to the callback function. .
 */
urlDao.getAllMonitoredUrl = function(callback) {
    Url.find({}, function(err, data) {
        if(!err) {
            applicationLog.log("GET (UrlModel): User requested for all the entry in urlModel collection");
            callback(data);
        } else {
            applicationLog.log("GET (UrlModel): Data not found in UrlModel");
            callback(false);
        }
    })
}

/**
 * @param urlId: id of the url that is no longer needed to be monitored and should to be deleted.
 * @param callback: callback function accepts response as the arguments
 * 
 * Delete the url entry of the provided url id.
 * If the url Id is found the deletion of the entry is successfull then responds with true, 
 * else if the deletion is unsuccessfull then responds with false 
 */
urlDao.deleteUrl = function(urlId, callback) {

    Url.find({'_id': urlId}).deleteOne().exec(function(err) {
        if(!err) {
            callback({'success' : true});
        } else {
            applicationLog.log("Delete (UrlModel): Data not found for id: "+urlId);
            callback({'success' : false});
        }
    });
}

/**
 * @param id: url Id of the Url
 * @param callback: callback function accepts response as the arguments
 * 
 * Get Details of the url by url Id.
 * If the id is not found then false is sent as argument to callback function.
 * If the id was found then responds with the url data.
 */
urlDao.getUrlInfoById = function(id, callback) {
    Url.findOne({'_id':id}, function(err, res) {
        if(!err && res) {
            callback(res);
        } else {
            applicationLog.log("Get (UrlModel): Data not found for id: "+id);
            callback(false);
        }
    });
}


/**
 * @param id: Url id of the url that is to be updated.
 * @param updatedData: Updated data for the given url id 
 * @param callback: callback function accepts response as the arguments
 * 
 * Update the Url entry of the given urlId with the updated data provided.
 * If update is successfull the urlId is sent as response.
 * If gets error while updating the url entry then false is sent as response 
 */
urlDao.updateUrlData = function(id, updatedData, callback) {

    Url.findOneAndUpdate({'_id':id}, {$set:{
        'url' : updatedData.url,
        'data' : updatedData.data
    }}, function(err, data){
        if(!err && data) {
            callback({'_id ' : id});
        } else {
            applicationLog.log("Update (UrlModel): Error while updating data for id: "+id);
            callback(false);
        }
    })
}

/**
 * @param data: New url entry data
 * @param callback: callback function accepts response as the arguments
 * 
 * Adds new url to the db. Create new url object and then add it to the databse
 * If adding new url entry is successful then sends response with the url Id
 * If error occurred while adding new url then false is sent as the response.
 */
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
            applicationLog.log("POST (UrlModel): Data successfully added to Db generatedId: "+data._id);
            callback({"_id": newUrl._id});        
        } else {
            applicationLog.log("POST (UrlModel) Error: Unable to add url");
            callback(false);
        }
    });
}

/**
 * Export the module
 */
module.exports = urlDao;