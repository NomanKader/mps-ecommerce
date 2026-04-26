import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';

const APP_URL = 'https://mps-ecommerce.onrender.com/';
const HEADER_COLOR = '#24498d';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const backSubscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBack) {
        return false;
      }

      webViewRef.current?.goBack();
      return true;
    });

    return () => {
      backSubscription.remove();
    };
  }, [canGoBack]);

  const handleNavigationStateChange = (navigationState: WebViewNavigation) => {
    setCanGoBack(navigationState.canGoBack);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={HEADER_COLOR} style="light" />

      <WebView
        ref={webViewRef}
        source={{ uri: APP_URL }}
        allowsBackForwardNavigationGestures
        domStorageEnabled
        javaScriptEnabled
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onHttpError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onLoadEnd={() => {
          setIsLoading(false);
        }}
        onLoadStart={() => {
          setHasError(false);
          setIsLoading(true);
        }}
        onNavigationStateChange={handleNavigationStateChange}
        pullToRefreshEnabled
        setSupportMultipleWindows={false}
        sharedCookiesEnabled
        startInLoadingState
        style={styles.webview}
      />

      {isLoading && !hasError ? (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <ActivityIndicator color="#17345f" size="large" />
          <Text style={styles.loadingText}>Loading MPS Ecommerce...</Text>
        </View>
      ) : null}

      {hasError ? (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorTitle}>Unable to load the storefront</Text>
          <Text style={styles.errorMessage}>
            Check the device connection or Render app status, then retry.
          </Text>
          <Pressable onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: HEADER_COLOR,
    flex: 1,
  },
  errorMessage: {
    color: '#4a5565',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  errorOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    bottom: 0,
    gap: 12,
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: 28,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  errorTitle: {
    color: '#17345f',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    bottom: 0,
    gap: 12,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  loadingText: {
    color: '#17345f',
    fontSize: 15,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#17345f',
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  webview: {
    flex: 1,
  },
});
