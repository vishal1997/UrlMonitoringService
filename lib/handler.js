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
    callback(200, {'id' : '123'});
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