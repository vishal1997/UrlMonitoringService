const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

/**
 * UrlMonitor Schema
 */
var urlMonitor = new Schema({
    _id : String,
    url : String,
    latencyList : [{
        'timestamp' : Date,
        'latency' : Number
    }]
});

urlMonitor.plugin(uniqueValidator);

var UrlMonitor = mongoose.model('UrlMonitor', urlMonitor);

/**
 * Export module
 */
module.exports = UrlMonitor;