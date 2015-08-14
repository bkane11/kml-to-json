@echo off
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
    node kml-to-json "%%f" --splitfolders
  )
  REM @echo. %dirname%\%%f
  REM node kml-to-json "%dirname%\%%f"
)
