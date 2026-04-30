# Mobile App Testing

This project is wrapped with Capacitor for Android.

## Web QA

```bash
npm run qa:screens
```

Screenshots are written to `qa-screenshots/`.

## Android App

Build and sync the web app into the native Android project:

```bash
npm run mobile:build
```

Open the Android project:

```bash
npm run mobile:open:android
```

Run on a connected device or emulator:

```bash
npm run mobile:run:android
```

Native Android builds require Android Studio or an Android SDK. If Gradle reports that the SDK location is missing, install Android Studio and make sure `ANDROID_HOME` points to the SDK path, or create `android/local.properties` with:

```properties
sdk.dir=C:\\Users\\daniel\\AppData\\Local\\Android\\Sdk
```

## Local PC Android Tester

This machine is configured with:

- Android Studio at `C:\Program Files\Android\Android Studio`
- Android SDK at `C:\Users\daniel\AppData\Local\Android\Sdk`
- AVD: `Wanderers_Test_API_36`
- Debug APK: `android\app\build\outputs\apk\debug\app-debug.apk`

Helper scripts:

```powershell
.\tools\build_android_debug.ps1
.\tools\run_android_emulator.ps1
.\tools\install_android_debug.ps1
```

If the emulator remains offline or reports missing acceleration, run the Android Emulator Hypervisor Driver installer as administrator:

```powershell
C:\Users\daniel\AppData\Local\Android\Sdk\extras\google\Android_Emulator_Hypervisor_Driver\silent_install.bat
```

Then reboot if Windows asks, start the emulator, and run `.\tools\install_android_debug.ps1`.
