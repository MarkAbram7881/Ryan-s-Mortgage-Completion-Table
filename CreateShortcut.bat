@echo off
echo Creating desktop shortcut for Client Tracker...

set "SCRIPT=%TEMP%\createShortcut.vbs"

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%SCRIPT%"
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\Client Tracker.lnk" >> "%SCRIPT%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%SCRIPT%"
echo oLink.TargetPath = "%~dp0index.html" >> "%SCRIPT%"
echo oLink.WorkingDirectory = "%~dp0" >> "%SCRIPT%"
echo oLink.Description = "Client Tracker - Mortgage Completion Management" >> "%SCRIPT%"
echo oLink.Save >> "%SCRIPT%"

cscript //nologo "%SCRIPT%"
del "%SCRIPT%"

echo.
echo Done! "Client Tracker" shortcut has been added to your desktop.
echo You can now close this window.
pause
