/**
 * Request handlers
 */
var dao = require('../dao/dao');
var randomId = require('./randomId');
var Sync = require('sync');
//Define handler
var handler = {};
//Define ping handler

handler.ping = function(data, callback) {
    callback(200);
}

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

   // Sync( function() {
    var payloads = JSON.parse(data.payloads);
    var url = payloads.url;
    var query = payloads.data;
    var method = payloads.method;
    var headers = data.headers;
    var id = randomId.createRandomId(10);
 
    if(url && method) {
        var urlObject = {
            'url' : url,
            'method' : method,
            'data' : query,
            'headers' : headers,
            'id' : id,
        }
        
        callback(200, {'id' : dao.addDataToUrlModel(urlObject)});
    } else {
        callback(500, {'error' : 'Error while monitoring the url'});
    }
};

/**
 * url - get
 * @param data: urlId
 * @todo: Get URL response time by the id
 */
handler._url.get = function(data, callback) {

    if(!data.queryStringObject) {
        callback(200, dao.getAllMonitoredUrl());
    } else {
        callback(200), dao.getUrlDetailsById(data.queryStringObject);
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
    var id = payloads.id;
    if(url) {
        var urlObject = {
            'url' : url,
            'data' : query,
        }
        
        callback(200, {'id' : dao.updateUrlData(id,urlObject)});
    } else {
        callback(500, {'error' : 'Error while monitoring the url'});
    }
};

/**
 * url-delete
 * @param data
 * @todo delete the urlId entry in the db
 */
handler._url.delete = function(data, callback) {
    dao.deleteUrl(data.trimmedPath);
    callback(200, {'success' : true});
};

//Export the module
module.exports = handler;