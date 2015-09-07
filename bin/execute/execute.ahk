
args = %1%
a:=RegExReplace(args,"^execute\:\/\/", "")
;MsgBox %a%
if %1%
{

	;run D:\\b28Translate\\node-b28\\bin\\execute\\notepad2.exe /g 100 D:\\b28Translate\\node-b28\\bin\\execute\\test.txt
	run %a%
} else {
	MsgBox, 3, 应用注册, 是否要注册应用打开?
}

