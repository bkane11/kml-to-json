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

for /F "tokens=* delims=" %%f in ('dir "%findglob%" /b') do (
  @echo. %dirname%\%%f
  node kml-to-json "%dirname%\%%f"
)