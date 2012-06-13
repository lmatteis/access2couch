Dim db: db = "C:\Documents and Settings\All Users\Documents\Collecting Missions\coll_miss.accdb"
Dim exportDir: exportDir = "C:\Documents and Settings\All Users\Documents\Collecting Missions\" '" SO prettify does not do VB well
Dim exportFile: exportFile = "Exp.txt"

Dim cn: Set cn = CreateObject("ADODB.Connection")

cn.Open _
    "Provider = Microsoft.ACE.OLEDB.12.0; " & _
    "Data Source =" & db

cn.Execute "SELECT * INTO [text;HDR=Yes;Database=" & exportDir & _
   ";CharacterSet=65001]." & exportFile & " FROM tblMembers"
