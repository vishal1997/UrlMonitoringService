var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');


var url = 'mongodb://user123:user123@ds121624.mlab.com:21624/url_monitor';

var mongoDb = {};

mongoDb.connect = function() {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connected successfully to mlab server");
    })
};

module.export = mongoDb;
