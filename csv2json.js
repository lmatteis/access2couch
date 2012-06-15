module.exports = csv2json

var fs = require('fs')
var path = require('path')
var csv = require('csv')

var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

function csv2json(csvsFolder) {
    this.csvsFolder = csvsFolder
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
csv2json.prototype.parseFile = function(csvFiles, index, callback, chunk, chunkSize) {
    var self = this
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
            // write it in chunk, like every chunkSize rows
            var remainder = index % chunkSize;
            if(remainder == 0 && index != 0) { // index is multiple of chunkSize
                chunk(self.json)

                self.json = [] // flush out memory
            }

            self.json.push(data);
        })
        .on('end',function(count){
            if(csvFiles[index + 1])
                self.parseFile(csvFiles, index + 1, callback, chunk, chunkSize)

            chunk(self.json, count, path.basename(csvFile, '.csv'))

            if(index == csvFiles.length - 1) { // last file, done parsing all files
            }
        })
        .on('error',function(error){
            console.log(error.message)
        })
    }
}
csv2json.prototype.parse = function(csvFiles, callback, chunk, chunkSize) {
    this.parseFile(csvFiles, 0, callback, chunk, chunkSize) // recursion, start at 0
}

// tests
/*
var csvsFolder = './access2couch_csvs/'
var c = new csv2json(csvsFolder)

var csvs = c.findCsvs()

var tot = 0;
c.parse(csvs, function(f) {
    console.log('parsing '+f)
}, function(chunk, total) {
    tot += chunk.length;
    console.log('Converted '+tot+' rows into JSON')
    if(total) 
        console.log('Finished parsing. Total rows:' +total)
}, 10000)
*/
