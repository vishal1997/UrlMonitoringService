const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

var urlMonitor = new Schema({
    id : {type:String, index: true},
    url : String,
    latencyList : [],
});

var LatencyListModel = {
    'timestamp' : Date,
    'latency' : Number
}

urlMonitor.plugin(uniqueValidator);

var UrlMonitor = mongoose.model('UrlMonitor', urlMonitor);

module.exports = UrlMonitor;