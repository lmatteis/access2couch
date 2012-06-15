#!/usr/bin/env node

var fs = require('fs')
var spawn = require('child_process').spawn
var url = require('url')
var rimraf = require('rimraf')
var couchdb = require('felix-couchdb')

var csv2json = require('./csv2json')

var csvsFolder = './access2couch_csvs/'
var args = process.argv
if(args.length && args[0] == 'node') {
    args = args.slice(2)
} else if(args.length && args[0] != 'node') {
    args = args.slice(1)
}

if(args.length < 3) {
    console.log('Usage:')
    console.log('  access2couch [MSAccess file-path] [tables...] [couch]')
    console.log('')
    console.log('Example:')
    console.log('  access2couch forests.mdb Forests Trees http://<username>:<password>@yourcouch.com/dbname')
    return;
}

var mdb = args[0],
    couchUrl = args[args.length - 1],
    tableNames = [];

for(var i=0; i<args.length; i++) {
    if(i == (args.length - 1)) continue; // dont add the last element
    if(i > 0) tableNames.push(args[i]);
}

// parse couch url
var couchObj = url.parse(couchUrl)

// create couch instance
var auth = couchObj.auth
var user = false,
    pass = false;
if(auth) {
    var s = auth.split(':')
    user = s[0]
    pass = s[1]
}
if(!couchObj.hostname) {
    throw new Error('Missing host parameter in Couch url')
}
var dbName = couchObj.pathname.substring(1) // substring is for removing the initial slash
if(!dbName) {
    throw new Error('Missing database name from couch url: http://couch.com/dbname')
}
console.log('Checking CouchDB connection')
var db = couchConn()
db.exists(function(er, exists) {
    if (er) throw new Error(JSON.stringify(er))
    if(exists) {
        console.log("Deleting database "+ dbName);
        db.remove(function(er) {
            if (er) throw new Error(JSON.stringify(er))

            var db = couchConn()
            db.create(function(er) {
                if (er) throw new Error(JSON.stringify(er))
                init()
            })
        })
    } else {
        console.log("Creating database "+ dbName);
        db.create(function(er) {
            if (er) throw new Error(JSON.stringify(er))
            init()
        })
    }
})

function couchConn() {
    var client = couchdb.createClient(couchObj.port, couchObj.hostname, user, pass)
    var db = client.db(dbName)
    return db
}


function init() {
    console.log('Converting Access tables to CSV files...')

    // remove and create folder for csvs
    rimraf.sync(csvsFolder)
    fs.mkdirSync(csvsFolder)

    // build the arguments to pass to access2csv
    var csvArgs = [__dirname + '/access2csv.js', mdb, csvsFolder]
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

            convertCsvToJson()
        }
    })
}

function convertCsvToJson() {
    console.log('Converting CSV files to JSON...')

    var csv = new csv2json(csvsFolder)
    var csvs = csv.findCsvs();
    console.log('Found ' + csvs.length + ' CSV(s) to parse')

    csv.parse(csvs, function(f) {
        console.log('Parsing '+f+' ...')
    }, function(chunk, total, accessTable) {
        var db = couchConn() // create a new connection for each chunk

        // the _bulk_docs API wants a JSON object with a property
        // 'docs' which is an array
        var obj = {}
        obj.docs = chunk
        db.bulkDocs(obj, function(er, ok) {
            if (er) throw new Error(JSON.stringify(er));
            console.log('Sent '+chunk.length+' items to CouchDB, on ' +couchObj.hostname +', port '+couchObj.port+' and database '+dbName)
            if(total) {
                console.log('Successfully finished sending table '+accessTable+' to Couch, with a total of '+total+' rows');
            }
        })
    }, 10000)
}

