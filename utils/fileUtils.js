var fileUtils = {};

fileUtils.createFileName = function () {
    let date = new Date();
    fileName = date.toISOString().slice(0, 10) + "-" + date.getHours() + "-" + date.getMinutes();

    console.log("File created with name - ", fileName);

    return fileName;
}

fileUtils.getISOStringFromFileName = function(fileName) {
    return fileName.slice(0,10);
}

fileUtils.getHoursFromFileName = function(fileName) {
    return fileName.slice(11, 13);
}

fileUtils.getMinutesFromFileName = function(fileName) {
    return fileName.slice(14,16);
}

/**
 * If fileName sent in the parameter is earlier than the current date then return true.
 * If it is the current date then return false;
 */
fileUtils.compareFileNameWithCurrentDate = function(fileName) {
    let date = new Date();
    currentMinFileName = this.createFileName();
    var isPreviousDateFile =  fileName < currentMinFileName;
    console.log("Is previous date file? : ", isPreviousDateFile);

    return isPreviousDateFile;
}

module.exports = fileUtils;