. "$PSScriptRoot\android-env.ps1"
$emulator = Join-Path $env:ANDROID_HOME "emulator\emulator.exe"
& $emulator -avd Wanderers_Test_API_36 -no-boot-anim -gpu swiftshader_indirect
