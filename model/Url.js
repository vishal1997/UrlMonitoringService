const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var url = new Schema({
    _id : String,
    url : {type : String, unique : true},
    method : String,
    data : {},
    headers : {}
});

url.plugin(uniqueValidator);

var Url = mongoose.model('Url', url);
module.exports = Url;