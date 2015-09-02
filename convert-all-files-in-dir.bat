@echo off
REM sample run command:
REM C:\Projects\kml-to-json\convert-all-files-in-dir.bat C:\temp\ventura_JSON

setlocal enabledelayedexpansion

REM @echo argument 1 = %~1
set defaultdirectory=C:\temp\Mendocino Hazard KMZ Files

if "%~1"=="" do(
  set dirname=%defaultdirectory%
) ELSE (
  set dirname=%~1
)

set findglob=%dirname%\*.km*


@echo "searching for km(l|z)s in %dirname%"
@echo "%findglob%"

for /F "tokens=* delims=" %%f in ('powershell -command "ls -Recurse \"%findglob%\" | select FullName " ') do (
  @echo %%f
  if exist %%f (
    node "%~dp0kml-to-json" "%%f" --splitfolders
  )
)
