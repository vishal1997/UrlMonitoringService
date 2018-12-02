const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

var urlMonitor = new Schema({
    _id : {type:String, index: true},
    url : String,
    latencyList : [{
        'timestamp' : Date,
        'latency' : Number
    }]
});

urlMonitor.plugin(uniqueValidator);

var UrlMonitor = mongoose.model('UrlMonitor', urlMonitor);

module.exports = UrlMonitor;