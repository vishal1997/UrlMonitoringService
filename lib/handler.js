/**
 * Request handlers
 */
var urlDao = require('../dao/urlDao');
var monitorUrlDao = require('..//dao/monitorUrlDao');
var randomId = require('../utils/randomId');
var percentile = require('../utils/percentile');
//Define handler
var handler = {};
//Define ping handler

//Not found handler
handler.notFound = function (data, callback) {
    callback(404);
};

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
 *@param data: (URL, method, data, headers)
 *@todo: Store the data to Db and start monitoring the URL.
 *      Return the ID.
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
 * url - get
 * @param data: urlId
 * @todo: Get URL response time by the id
 */
handler._url.get = function(data, callback) {

    if(!data.trimmedPath) {
        urlDao.getAllMonitoredUrl(function(res) {
            if(res) {
                callback(200, res);
            }else {
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
                        callback(404, {"Error":"No data found"});
                    }
                });
            }
        });
    }
};

/**
 * url-put
 * @param data: 
 * @todo update url data of the given urlId
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
            callback(200, res);
        })
        
    } else {
        callback(500, {'error' : 'Not request body found. Provide new URL in the request body'});
    }
};

/**
 * url-delete
 * @param data
 * @todo delete the urlId entry in the db
 */
handler._url.delete = function(data, callback) {
    urlDao.deleteUrl(data.trimmedPath, function(res) {
        monitorUrlDao.deleteUrl(data.trimmedPath, function(res) {
            callback(200, res);
        })
    });
};

//Export the module
module.exports = handler;