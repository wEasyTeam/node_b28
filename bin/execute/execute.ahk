
args = %1%
a:=RegExReplace(args,"^execute\:\/\/", "")
;MsgBox %a%
if %1%
{

	;run D:\\b28Translate\\node-b28\\bin\\execute\\notepad2.exe /g 100 D:\\b28Translate\\node-b28\\bin\\execute\\test.txt
	run %a%
} else {
	MsgBox, 3, Ӧ��ע��, �Ƿ�װӦ�ô���?
	IfMsgBox Yes
	{
		RegWrite, REG_SZ, HKEY_CLASSES_ROOT, execute\shell\open\command, , %A_ScriptFullPath% "`%1"
		RegWrite, REG_SZ, HKEY_CLASSES_ROOT, execute\shell\open\command, URL Protocol
		MsgBox ��װ�ɹ�!
	}
	IfMsgBox No
	{
		RegDelete, HKEY_CLASSES_ROOT, execute
		MsgBox ж�سɹ�!
	}
}

