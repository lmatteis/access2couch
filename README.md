access2couch
============

A command-line utility for Windows, that pushes a MS Access database to a CouchDB instance. Written in Node.js

This tool depends on another little utility written in VBScript simply to convert a MS access database to CSV (using ODBC), which is then used by Node to build the JSON.

You must pass in the query that will normalize the data. So if you have many 1:n relationships in your database, you have to provide the query that will output the data in a normalized form so that it can be inserted into Couch, as you please.
