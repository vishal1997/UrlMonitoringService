/**
 * Request handlers
 */


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
    //@todo save this information to the database
    var protocol = typeof(data.payload.protocol) == 'string' && ['https','http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var method = typeof(data.payload.method) == 'string' && ['post','get','put','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
  
    if(protocol && url && method && successCodes) {
        var urlObject = {
            'protocal' : protocol,
            'url' : url,
            'method' : method,
            'successCodes' : successCodes
        }
        callback(200, {'id' : urlObject});
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

};

/**
 * url-put
 * @param data: 
 * @todo update url data of the given urlId
 */
handler._url.put = function(data, callback) {

};

/**
 * url-delete
 * @param data
 * @todo delete the urlId entry in the db
 */
handler._url.delete = function(data, callback) {

};

//Export the module
module.exports = handler;