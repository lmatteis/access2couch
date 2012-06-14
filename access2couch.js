#!/usr/bin/env node

var fs = require('fs')
var spawn = require('child_process').spawn
var rimraf = require('rimraf')
var couchdb = require('felix-couchdb')

var csv2json = require('./csv2json')

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


console.log('Converting Access tables to CSV files...')

// create folder for csvs
var csvsFolder = './access2couch_csvs/'
rimraf.sync(csvsFolder)
fs.mkdirSync(csvsFolder)

// build the arguments to pass to access2csv
var csvArgs = [__dirname + '/access2csv.js', db, csvsFolder]
for(var i in tableNames) {
    csvArgs.push(tableNames[i])
}

// run access2csv
var access2csv = spawn('cscript', csvArgs)

var csvError = false;
access2csv.stderr.on('data', function (data) {
    csvError = ''+data;
})

access2csv.on('exit', function (code) {
    //console.log('child process exited with code ' + code);
    if(csvError) {
        console.log(csvError)
    } else {
        console.log('Successfully converted Access tables to CSV files')
        console.log('Converting CSV files to JSON...')

        var csv = new csv2json(csvsFolder)
        var csvs = csv.findCsvs();
        console.log('Found ' + csvs.length + ' CSV(s) to parse')

        csv.parse(csvs, function(f) {
            console.log('Parsing '+f+' ...')
        }, function(chunk, total) {
            var couchPort = 5984
            var couchUrl = 'localhost'
            var couchDb = 'geosite'

            console.log('Sending a JSON of '+chunk.length+' items to CouchDB, on ' +couchUrl +', port '+couchPort+' and database '+couchDb)
            var client = couchdb.createClient(couchPort, couchUrl)
            var db = client.db(couchDb)

            db.bulkDocs(chunk)
        }, 10000)

    }
})

