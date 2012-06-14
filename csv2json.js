module.exports = csv2json

var fs = require('fs')
var path = require('path')
var csv = require('csv')

var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

function csv2json(csvsFolder, jsonOut) {
    this.csvsFolder = csvsFolder
    this.jsonOut = jsonOut
    this.json = []
}

csv2json.prototype.findCsvs = function() {
    var files = fs.readdirSync(this.csvsFolder)
    var ret = []
    for(var i in files) {
        if(endsWith(files[i], '.csv')) {
            ret.push(files[i])
        }
    }
    return ret
}
csv2json.prototype.parseFile = function(csvFiles, index, callback) {
    var that = this
    if(csvFiles[index]) {
        var csvFile = this.csvsFolder + csvFiles[index]
        callback(csvFile)
        csv()
        .fromPath(csvFile,{
            columns: true
        })
        .transform(function(data) {
            data.type = path.basename(csvFile, '.csv')
            return data
        })
        .on('data',function(data,index){
            //console.log('#'+index+' '+JSON.stringify(data))
            that.json.push(data);
        })
        .on('end',function(count){
            if(csvFiles[index + 1])
                this.parseFile(csvFiles, index + 1, callback)

            if(index == csvFiles.length - 1) { // last file
                fs.writeFile(that.jsonOut, JSON.stringify(that.json))
            }
        })
        .on('error',function(error){
            console.log(error.message)
        })
    }
}
csv2json.prototype.parse = function(csvFiles, callback) {
    this.parseFile(csvFiles, 0, callback) // recursion, start at 0
}

// tests
var csvsFolder = './access2couch_csvs/'
var jsonOut = csvsFolder + 'out.json'
var c = new csv2json(csvsFolder, jsonOut)

var csvs = c.findCsvs()

c.parse(csvs, function(f) {
    console.log('parsing '+f+' into ' + c.jsonOut)
})
