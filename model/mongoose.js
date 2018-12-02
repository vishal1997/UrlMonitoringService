const mongooseClient = require('mongoose');
const options = {
    useNewUrlParser : true
}
const url = 'mongodb://user123:user123@ds121624.mlab.com:21624/url_monitor';
mongooseClient.set('useCreateIndex', true);
var mongoose = {};

mongoose.connect = function() {
    mongooseClient.connect(url, options, function(error) {
        if (!error) {
            console.log("Successfully connected with MongoDB database.")
        } else {
            console.log("Some error occured connecting to MongoDB database.");
        }
    });
}

module.exports = mongoose;
