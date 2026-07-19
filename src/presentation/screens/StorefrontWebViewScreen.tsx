import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Linking,
  PermissionsAndroid,
  Platform,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type {
  ShouldStartLoadRequest,
  WebViewMessageEvent,
  WebViewNavigation,
  WebViewProgressEvent,
} from 'react-native-webview/lib/WebViewTypes';

import { appConfig } from '../../core/config/appConfig';
import { colors } from '../../core/theme/colors';
import { StorefrontUrlPolicyImpl } from '../../data/storefront/StorefrontUrlPolicyImpl';
import { LoadingProgress } from '../components/LoadingProgress';
import { StateMessage } from '../components/StateMessage';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const injectedJavaScript = `
  (function () {
    if (window.__avsNavigationBridgeInstalled) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        canGoBack: window.history.length > 1,
        type: 'navigation',
        url: window.location.href
      }));
      return;
    }

    window.__avsNavigationBridgeInstalled = true;

    var notifyNavigation = function () {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        canGoBack: window.history.length > 1,
        type: 'navigation',
        url: window.location.href
      }));
    };

    var originalPushState = window.history.pushState;
    var originalReplaceState = window.history.replaceState;

    window.history.pushState = function () {
      var result = originalPushState.apply(this, arguments);
      window.setTimeout(notifyNavigation, 0);
      return result;
    };

    window.history.replaceState = function () {
      var result = originalReplaceState.apply(this, arguments);
      window.setTimeout(notifyNavigation, 0);
      return result;
    };

    window.addEventListener('popstate', notifyNavigation);
    window.addEventListener('hashchange', notifyNavigation);

    document.addEventListener(
      'click',
      function (event) {
        var link = event.target && event.target.closest ? event.target.closest('a[href^="tel:"]') : null;

        if (!link) {
          return;
        }

        event.preventDefault();
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'phone',
          url: link.href
        }));
      },
      true
    );

    if (!window.navigator.share) {
      window.navigator.share = function (data) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          payload: data || {},
          type: 'share'
        }));
        return Promise.resolve();
      };
    }

    notifyNavigation();
  })();
  true;
`;

const noCacheHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Expires: '0',
  Pragma: 'no-cache',
};

const cacheBusterParam = 'app_cache_bust';

const appendCacheBuster = (url: string, value: number) => {
  try {
    const parsedUrl = new URL(url);

    parsedUrl.searchParams.set(cacheBusterParam, String(value));

    return parsedUrl.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';

    return `${url}${separator}${cacheBusterParam}=${value}`;
  }
};

const stripCacheBuster = (url: string) => {
  try {
    const parsedUrl = new URL(url);

    parsedUrl.searchParams.delete(cacheBusterParam);

    return parsedUrl.toString();
  } catch {
    return url;
  }
};

const requestPhonePermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.CALL_PHONE;
  const currentStatus = await PermissionsAndroid.check(permission);

  if (currentStatus) {
    return true;
  }

  const result = await PermissionsAndroid.request(permission, {
    buttonNegative: 'Cancel',
    buttonPositive: 'Allow',
    message: "Allow Av's Store to open phone calls from the app.",
    title: 'Phone permission',
  });

  return result === PermissionsAndroid.RESULTS.GRANTED;
};

export function StorefrontWebViewScreen() {
  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);
  const webCanGoBackRef = useRef(false);
  const currentPageUrlRef = useRef<string>(appConfig.storefrontUrl);
  const insets = useSafeAreaInsets();
  const urlPolicy = useMemo(() => new StorefrontUrlPolicyImpl(), []);
  const networkStatus = useNetworkStatus();
  const [hasPageError, setHasPageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [cacheBuster, setCacheBuster] = useState(() => Date.now());
  const [sourceBaseUrl, setSourceBaseUrl] = useState<string>(appConfig.storefrontUrl);
  const storefrontUrl = useMemo(
    () => appendCacheBuster(sourceBaseUrl, cacheBuster),
    [cacheBuster, sourceBaseUrl],
  );
  const isOffline =
    !networkStatus.isConnected || !networkStatus.isInternetReachable;

  const reload = useCallback(() => {
    setHasPageError(false);
    setIsLoading(true);
    setSourceBaseUrl(currentPageUrlRef.current);
    setCacheBuster(Date.now());
  }, []);

  const handleAndroidBackPress = useCallback(() => {
    if (canGoBackRef.current) {
      webViewRef.current?.goBack();
      return true;
    }

    if (webCanGoBackRef.current) {
      webViewRef.current?.injectJavaScript('window.history.back(); true;');
      return true;
    }

    return false;
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleAndroidBackPress,
    );

    return () => subscription.remove();
  }, [handleAndroidBackPress]);

  const handleNavigationStateChange = useCallback((event: WebViewNavigation) => {
    canGoBackRef.current = event.canGoBack;
    currentPageUrlRef.current = stripCacheBuster(event.url);
  }, []);

  const handleShouldStartLoad = useCallback(
    (request: ShouldStartLoadRequest) => {
      if (urlPolicy.canOpenInsideApp(request.url)) {
        return true;
      }

      if (urlPolicy.canOpenExternally(request.url)) {
        if (request.url.startsWith('tel:')) {
          void requestPhonePermission().then((isGranted) => {
            if (isGranted) {
              void Linking.openURL(request.url);
            }
          });
        } else {
          void Linking.openURL(request.url);
        }
      }

      return false;
    },
    [urlPolicy],
  );

  const handleLoadProgress = useCallback((event: WebViewProgressEvent) => {
    setProgress(event.nativeEvent.progress);
  }, []);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    if (!event.nativeEvent.data) {
      return;
    }

    try {
      const message = JSON.parse(event.nativeEvent.data) as {
        canGoBack?: boolean;
        payload?: {
          text?: string;
          title?: string;
          url?: string;
        };
        type?: string;
        url?: string;
      };

      if (message.type === 'navigation') {
        webCanGoBackRef.current = Boolean(message.canGoBack);

        if (message.url) {
          currentPageUrlRef.current = stripCacheBuster(message.url);
        }
      }

      if (message.type === 'share') {
        void Share.share({
          message: [message.payload?.text, message.payload?.url].filter(Boolean).join('\n'),
          title: message.payload?.title,
          url: message.payload?.url,
        });
      }

      if (message.type === 'phone' && message.url) {
        const phoneUrl = message.url;

        void requestPhonePermission().then((isGranted) => {
          if (isGranted) {
            void Linking.openURL(phoneUrl);
          }
        });
      }
    } catch {
      // Ignore non-JSON messages from the web app.
    } finally {
      setHasPageError(false);
    }
  }, []);

  if (isOffline) {
    return (
      <View style={styles.root}>
        <View style={[styles.statusBarSpacer, { height: insets.top }]} />
        <View style={styles.content}>
          <StateMessage
            actionLabel="Try again"
            message="Check your internet connection, then reload the store."
            onAction={reload}
            title="You are offline"
          />
        </View>
      </View>
    );
  }

  if (hasPageError) {
    return (
      <View style={styles.root}>
        <View style={[styles.statusBarSpacer, { height: insets.top }]} />
        <View style={styles.content}>
          <StateMessage
            actionLabel="Reload"
            message="The store could not be loaded right now. Reload to try again."
            onAction={reload}
            title="Store unavailable"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.statusBarSpacer, { height: insets.top }]} />
      <View style={styles.content}>
        <LoadingProgress progress={progress} visible={isLoading} />
        <WebView
          key={storefrontUrl}
          ref={webViewRef}
          allowsBackForwardNavigationGestures
          applicationNameForUserAgent={appConfig.appName}
          cacheEnabled={false}
          cacheMode="LOAD_NO_CACHE"
          domStorageEnabled
          injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
          injectedJavaScript={injectedJavaScript}
          javaScriptEnabled
          onError={() => setHasPageError(true)}
          onHttpError={(event) => {
            if (event.nativeEvent.statusCode >= 500) {
              setHasPageError(true);
            }
          }}
          onLoadEnd={() => setIsLoading(false)}
          onLoadProgress={handleLoadProgress}
          onLoadStart={() => {
            setHasPageError(false);
            setIsLoading(true);
          }}
          onMessage={handleMessage}
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          overScrollMode="never"
          pullToRefreshEnabled
          setSupportMultipleWindows={false}
          source={{ headers: noCacheHeaders, uri: storefrontUrl }}
          startInLoadingState
          style={styles.webView}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  statusBarSpacer: {
    backgroundColor: colors.statusBar,
    width: '100%',
  },
  content: {
    backgroundColor: colors.background,
    flex: 1,
  },
  webView: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
