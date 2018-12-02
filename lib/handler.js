/**
 * Request handlers
 */
var urlDao = require('../dao/urlDao');
var monitorUrlDao = require('..//dao/monitorUrlDao');
var randomId = require('../utils/randomId');
var percentile = require('../utils/percentile');
var applicationLog = require('./application.log');
var workers = require('./workers');
//Define handler
var handler = {};
//Define ping handler

//Not found handler
handler.notFound = function (data, callback) {
    callback(404);
};

/**
 * Handler for path /
 */
handler.url = function(data, callback) {
    var acceptableMethod= ['post','get','put','delete'];
    if(acceptableMethod.indexOf(data.method) > -1) {
        handler._url[data.method](data, callback);
    } else {
        callback(405);
    }
};

//Container for the users submethods
handler._url= {};

/** url - post 
 *  @param data: (URL, method, data, headers)
 *  Handler for the post request.
 *  Store the data to Db and start monitoring the URL.
 *  Returns the url ID if successfully added url to database otherwise responds with the error msg.
 */

handler._url.post = function(data, callback) {
    var payloads = JSON.parse(data.payloads);
    var url = payloads.url;
    var query = payloads.data;
    var method = payloads.method;
    var headers = data.headers;
    var id = randomId.createRandomString(10);
 
    if(url && method) {
        var urlObject = {
            'url' : url,
            'method' : method,
            'data' : query,
            'headers' : headers,
            '_id' : id,
        }
        urlDao.addDataToUrlModel(urlObject, function(res) {
            if (res) {
                monitorUrlDao.addUrlData(res, function (err){
                    if (!err) {
                        workers.updateMonitoredUrlList(true);
                        callback(200, res);
                    } else {
                        callback(500,{"error": "unable to save to URL Monitor."});
                    }
                });    
            } else {
                callback(500, {"error" : "Url already added to the database"});
            }
        });
    } else {
        callback(500, {'error' : 'Request body for the url is missing. Please add request body'});
    }
};

/**
 * 
 * @param data: urlId
 * Handler for the get request
 * Get URL details with the list of response time by the id.
 * If id is not found then get all the url details that are monitored.
 */
handler._url.get = function(data, callback) {

    if(!data.trimmedPath) {
        urlDao.getAllMonitoredUrl(function(res) {
            if(res) {
                applicationLog.log("Responding with all the entry in url collection");
                callback(200, res);
            }else {
                applicationLog.log("Error: Empty database");
                callback(404, {'error':'Data not found'});
            }
        });
    } else {
        monitorUrlDao.getUrlDetailsById(data.trimmedPath, function(response) {
            if (response) {
                urlDao.getUrlInfoById(response._id, function(urlInfo) {
                    if(urlInfo){
                        var percentileInfo = percentile.getPercentileInfo(percentile.percentiles,response.responses);
                        var idInformation = {
                            "_id" : response._id,
                            "responses" : response.responses,
                            "55th_percentile" : percentileInfo.percentile_55,
                            "75th_percentile" : percentileInfo.percentile_75,
                            "95th_percentile" : percentileInfo.percentile_95,
                            "99th_percentile" : percentileInfo.percentile_99,
                            "url" : urlInfo.url,
                            "method" : urlInfo.method,
                            "data" : urlInfo.data,
                            "headers" : urlInfo.headers
                        };
                        callback(200, idInformation);
                    } else {
                        applicationLog.log("Data found in url collection but no data found in urlMonitor collection for id: "+response._id);
                        callback(404, {"Error":"No data found"});
                    }
                });
            }
        });
    }
};

/**
 * 
 * @param data: Data that is to be updated with the old data
 * Handler for put request.
 * Update url data of the given urlId
 */
handler._url.put = function(data, callback) {
    var payloads = JSON.parse(data.payloads);
    var url = payloads.url;
    var query = payloads.data;
    var id = data.trimmedPath;
    if(url) {
        var urlObject = {
            'url' : url,
            'data' : query,
        }
        urlDao.updateUrlData(id,urlObject, function(res) {
            applicationLog.log("Details updated for id: "+id);
            workers.updateMonitoredUrlList(true);
            callback(200, res);
        })
        
    } else {
        applicationLog.log("Invalid data prvided by the user");
        callback(500, {'error' : 'Not request body found. Provide new URL in the request body'});
    }
};

/**
 * @param data
 * Hanlder for delete request
 * Delete the urlId entry in the db
 */
handler._url.delete = function(data, callback) {
    urlDao.deleteUrl(data.trimmedPath, function(res) {
        monitorUrlDao.deleteUrl(data.trimmedPath, function(res) {
            applicationLog.log("User requested to delete id: "+data.trimmedPath);
            workers.updateMonitoredUrlList(true);
            callback(200, res);
        })
    });
};

/**
 * Export the module 
 */
module.exports = handler;