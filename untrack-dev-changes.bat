@echo off
setlocal enabledelayedexpansion

set "filename=dev-changes.txt"
set "command=git update-index --assume-unchanged"

for /f "tokens=*" %%i in (%filename%) do (
    set "line=%%i"
    echo Executing: %command% !line!
    %command% !line!
)

endlocal
