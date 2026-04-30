$env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$studioJbr = "C:\Program Files\Android\Android Studio\jbr"
if (Test-Path $studioJbr) {
  $env:JAVA_HOME = $studioJbr
}
$paths = @(
  (Join-Path $env:ANDROID_HOME "platform-tools"),
  (Join-Path $env:ANDROID_HOME "emulator"),
  (Join-Path $env:ANDROID_HOME "cmdline-tools\latest\bin")
)
if ($env:JAVA_HOME) {
  $paths = @((Join-Path $env:JAVA_HOME "bin")) + $paths
}
$env:Path = ($paths -join ";") + ";" + $env:Path
