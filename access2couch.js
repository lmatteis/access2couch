var fs = require('fs')

var args = process.argv.slice(2)

if(args.length < 3) {
    console.log('Usage:')
    console.log('  access2couch [MSAccess file-path] [tables...] [couch]')
    console.log('')
    console.log('Example:')
    console.log('  access2couch forests.mdb Forests Trees http://<username>:<password>@yourcouch.com/dbname')
    return;
}

var db = args[0],
    couchUrl = args[args.length - 1],
    tableNames = [];

for(var i=0; i<args.length; i++) {
    if(i == (args.length - 1)) continue; // dont add the last element
    if(i > 0) tableNames.push(args[i]);
}

console.log(db, couchUrl, tableNames);

console.log('Converting Access tables to CSV')
var csvsFolder = __dirname + '/access2couch_csvs/'
fs.mkdir(csvsFolder)

