import { StyleSheet, View } from 'react-native';

import { colors } from '../../core/theme/colors';

type LoadingProgressProps = {
  progress: number;
  visible: boolean;
};

export function LoadingProgress({ progress, visible }: LoadingProgressProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.progressTrack,
    height: 2,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    backgroundColor: colors.progressFill,
    height: '100%',
  },
});
