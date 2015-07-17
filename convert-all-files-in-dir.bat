@echo off
setlocal enabledelayedexpansion

REM @echo argument 1 = %~1

if "%~1"=="" do(
  set dirname=C:\temp\Mendocino Hazard KMZ Files
) ELSE (
  set dirname=%~1
)

set findglob=%dirname%\*.km*

@echo "searching for km(l|z)s in %dirname%"

for /F "tokens=* delims=" %%f in ('dir "%findglob%" /b') do (
  @echo. %dirname%\%%f
  node kml-to-json "%dirname%\%%f"
)