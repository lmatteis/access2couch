access2couch
============

A command-line utility for Windows, that pushes a MS Access database to a CouchDB instance. Written in Node.js

This tool uses a little script written in JScript simply to convert a MS access database to CSV (using ODBC), which is then used by Node to build the JSON.

## Install

1. Download and install the Windows version of node which can be found on nodejs.org

2. Then download this project and navigate to it using `cmd`
   
       > cd path_to_this_project

3. run `npm install -g`

4. Before you run the command, remember that your database will be wiped cleaned everytime. Simply run

    Usage:
      access2couch [MSAccess file-path] [tables...] [couch]

    Example:
        access2couch forests.mdb Forests Trees http://<username>:<password>@yourcouch.com/dbname
