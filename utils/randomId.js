var urlDao = require('../dao/urlDao');
var Url = require('../model/Url');
var randomId = {};

randomId.createRandomString = function(strLength){
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if(strLength){
      // Define all the possible characters that could go into a string
      var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  
      // Start the final string
      var str = '';
      for(i = 1; i <= strLength; i++) {
          // Get a random charactert from the possibleCharacters string
          var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
          // Append this character to the string
          str+=randomCharacter;
      }
      // Return the final string
      return str;
    } else {
      return false;
    }
  };

  randomId.createRandomId = function(strLength) {

    var id = randomId.createRandomString(strLength);
    urlDao.getUrlInfoById(id, function(err, data) {
      if(!err && data) {
      
      } else {
          randomId.createRandomId(strLength);
      }
    });
    return id;
  }

  module.exports = randomId;