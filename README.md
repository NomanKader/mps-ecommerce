# Av's Store Mobile App

Expo React Native WebView app for `https://avsstoreonline.com/`.

## Structure

- `src/core`: app configuration and shared theme values.
- `src/domain`: app-facing contracts and business rules.
- `src/data`: concrete implementations for domain contracts.
- `src/presentation`: React Native screens, components, and hooks.

## Local Development

```bash
npm install
npm run start
npm run android
```

Use `npm run start:clear` if Metro caching causes stale assets or JavaScript.

## Android Builds

Local APK:

```bash
npm run android:apk
```

The scripts use a project-local Gradle home at `.gradle-local` so global Gradle init
files do not override Android dependency repositories.

The local release APK is generated at:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Debug APK:

```bash
npm run android:apk:debug
```

Clean native build outputs:

```bash
npm run android:clean
```

EAS cloud builds:

```bash
npx eas build -p android --profile preview
npx eas build -p android --profile production
```

The Android application id is `com.avsstore.app`.
