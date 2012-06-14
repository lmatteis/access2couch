module.exports = csv2json

var csv = require('csv');

function csv2json(csvsFolder) {
    this.csvsFolder = csvsFolder;
    /*
    csv()
    .fromPath('./DISTRIBUTION.csv',{
        columns: true
    })
    .on('data',function(data,index){
        console.log('#'+index+' '+JSON.stringify(data));
    })
    .on('end',function(count){
        console.log('Number of lines: '+count);
    })
    .on('error',function(error){
        console.log(error.message);
    });
    */
}

csv2json.prototype.findFiles = function() {
    fs.readdirSync(this.csvsFolder)
}

// tests
var c = new csv2json('./access2couch_csvs')

c.findFiles();
