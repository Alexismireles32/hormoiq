import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function ImpactScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚡</Text>
        <Text style={styles.title}>Discover What Works</Text>
        <Text style={styles.description}>
          See which supplements and habits actually affect YOUR hormones. Stop guessing, start knowing.
        </Text>
        <Text style={styles.comingSoon}>Coming in Phase 5</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 320,
  },
  comingSoon: {
    fontSize: 14,
    opacity: 0.4,
    fontStyle: 'italic',
  },
});

