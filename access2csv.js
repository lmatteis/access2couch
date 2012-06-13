/*
 * should be run by cscript.exe
 */

var args = WScript.arguments

if(!args.length || args.length < 3) {
    WScript.echo('Usage:')
    WScript.echo('  cscript access2csv.js <dbPath> <exportDir> [tableNames...]')
    WScript.quit()
}

var tableNames = []
var db, 
    exportDir;
for(var i=0; i<args.length; i++) {
    if(i == 0) db = args(i)
    else if(i == 1) exportDir = args(i)
    else if(i > 1) tableNames.push(args(i)) // weird ass!?
}

// open connection
var cn = new ActiveXObject("ADODB.Connection")
cn.Open("Provider = Microsoft.ACE.OLEDB.12.0; Data Source =" + db)

for(var i in tableNames) {
    var table = tableNames[i]
    var exportFile = table + '.csv'
    cn.Execute("SELECT * INTO [text;HDR=Yes;Database=" + exportDir + ";CharacterSet=65001]." + exportFile + " FROM " + table)
}

// tried getting table names, but not working, so letting users provide a list of table names
/*
var rs = cn.Execute("SELECT Name FROM MSysObjects WHERE type = 1 AND NAME NOT LIKE 'MSYS*' ORDER BY NAME;")
while(!rs.EOF) {
    WScript.echo(rs('Name'))
    rs.MoveNext;
}
*/
