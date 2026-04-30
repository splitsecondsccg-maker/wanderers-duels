. "$PSScriptRoot\android-env.ps1"
$apk = Resolve-Path "$PSScriptRoot\..\android\app\build\outputs\apk\debug\app-debug.apk"
adb install -r $apk
