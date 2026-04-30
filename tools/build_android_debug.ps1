. "$PSScriptRoot\android-env.ps1"
Set-Location (Resolve-Path "$PSScriptRoot\..\android")
.\gradlew.bat assembleDebug
