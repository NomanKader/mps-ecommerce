import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { appConfig } from '../../core/config/appConfig';
import { colors } from '../../core/theme/colors';

type StateMessageProps = {
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
};

export function StateMessage({
  title,
  message,
  actionLabel,
  onAction,
}: StateMessageProps) {
  return (
    <View style={styles.container}>
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={require('../../../assets/icon.png')}
        style={styles.logo}
      />
      <Text style={styles.appName}>{appConfig.appName}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onAction}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    height: 84,
    marginBottom: 16,
    width: 84,
  },
  appName: {
    color: colors.foreground,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  title: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 320,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 140,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.76,
  },
  buttonText: {
    color: colors.primaryText,
    fontSize: 15,
    fontWeight: '700',
  },
});
