import { StyleSheet, View, Text } from 'react-native';
import { EliAnimatedBackground } from '@/components/EliAnimatedBackground';
import { DesignSystem } from '@/constants/DesignSystem';

export default function ImpactScreen() {
  return (
    <EliAnimatedBackground type="multi" scrollEnabled={false}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚡</Text>
        <Text style={styles.title}>Discover What Works</Text>
        <Text style={styles.description}>
          See which supplements and habits actually affect YOUR hormones. Stop guessing, start knowing.
        </Text>
        <Text style={styles.comingSoon}>Coming in Phase 5</Text>
      </View>
    </EliAnimatedBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: DesignSystem.typography.fontSize['4xl'],
    fontWeight: DesignSystem.typography.fontWeight.semibold,
    marginBottom: 16,
    textAlign: 'center',
    color: DesignSystem.colors.text.primary,
  },
  description: {
    fontSize: DesignSystem.typography.fontSize.base,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: DesignSystem.typography.fontSize.base * 1.6,
    maxWidth: 320,
    fontWeight: DesignSystem.typography.fontWeight.light,
  },
  comingSoon: {
    fontSize: DesignSystem.typography.fontSize.sm,
    color: DesignSystem.colors.text.tertiary,
    fontStyle: 'italic',
    fontWeight: DesignSystem.typography.fontWeight.light,
  },
});
