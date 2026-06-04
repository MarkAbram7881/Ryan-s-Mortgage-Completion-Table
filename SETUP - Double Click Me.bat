@echo off
echo Setting up Ryan's Tracker...

set "SCRIPT=%TEMP%\createShortcut.vbs"

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%SCRIPT%"
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\Ryan's Tracker.lnk" >> "%SCRIPT%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%SCRIPT%"
echo oLink.TargetPath = "%~dp0index.html" >> "%SCRIPT%"
echo oLink.WorkingDirectory = "%~dp0" >> "%SCRIPT%"
echo oLink.Description = "Ryan's Tracker" >> "%SCRIPT%"
echo oLink.Save >> "%SCRIPT%"

cscript //nologo "%SCRIPT%"
del "%SCRIPT%"

echo.
echo Done! You now have a "Ryan's Tracker" icon on your desktop.
echo You can close this window.
timeout /t 5
