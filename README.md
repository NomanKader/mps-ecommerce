## AV's Store mobile app

Expo React Native wrapper for `https://mps-ecommerce.onrender.com/` using `react-native-webview`.

### Run

```bash
cd mobile-app
npm install
npm run android
```

For iOS:

```bash
cd mobile-app
npm run ios
```

For Expo dev server only:

```bash
cd mobile-app
npm run start
```

### Notes

- Android hardware back will navigate backward inside the WebView when possible.
- Pull-to-refresh is enabled.
- A retry screen appears if the remote site fails to load.
- The WebView injects a mobile viewport and the shell adapts loading/error states for compact phones, tablets, and orientation changes.
