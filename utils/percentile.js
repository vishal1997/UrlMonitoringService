
var percentile = { 
        percentiles:[{
        name : "percentile_55",
        value : 0.54
    }, {
        name : "percentile_75",
        value : 0.74
    }, {
        name : "percentile_95",
        value : 0.94
    }, {
        name : "percentile_99",
        value : 0.98
    }]
}

 percentile.getPercentileInfo = function (percentiles, array) {
    var res = {};
    // Cloning as we dont want the latency to be sorted. 
    // Only sorting this would sort the actual responses.
    var sortedArray = array.slice().sort();
    percentiles.forEach(element => {
        res[element.name] = sortedArray[Math.floor(array.length * element.value)];
    });

    return res;
}

module.exports = percentile;