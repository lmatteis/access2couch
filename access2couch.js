#!/usr/bin/env node

var fs = require('fs')
var spawn = require('child_process').spawn

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


console.log('Converting Access tables to CSV files')

// create folder for csvs
var csvsFolder = './access2couch_csvs/'
fs.mkdir(csvsFolder)

// build the arguments to pass to access2csv
var csvArgs = [__dirname + '/access2csv.js', db, csvsFolder]
for(var i in tableNames) {
    csvArgs.push(tableNames[i])
}

// run access2csv
var access2csv = spawn('cscript', csvArgs)

access2csv.stdout.on('data', function (data) {    // register one or more handlers
    console.log('stdout: ' + data);
});

access2csv.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
});

access2csv.on('exit', function (code) {
    console.log('child process exited with code ' + code);
});

