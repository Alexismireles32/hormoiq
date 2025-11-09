import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ProtocolCard } from '@/components/ProtocolCard';
import { PROTOCOL_LIBRARY, getCategoryIcon, getCategoryColor } from '@/lib/protocol-library';
import { Protocol, UserProtocol } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';

type FilterType = 'all' | Protocol['category'];

export default function ProtocolsScreen() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedProtocol, setSelectedProtocol] = useState<typeof PROTOCOL_LIBRARY[number] | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeProtocols, setActiveProtocols] = useState<UserProtocol[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActiveProtocols();
  }, []);

  const loadActiveProtocols = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_protocols')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      setActiveProtocols((data as UserProtocol[]) || []);
    } catch (error) {
      console.error('Error loading active protocols:', error);
    }
  };

  const handleProtocolPress = (protocol: typeof PROTOCOL_LIBRARY[number]) => {
    setSelectedProtocol(protocol);
    setShowDetail(true);
  };

  const handleStartProtocol = async () => {
    if (!user || !selectedProtocol) return;

    // Check if already active
    const alreadyActive = activeProtocols.some(
      ap => ap.protocol?.name === selectedProtocol.name && ap.status === 'active'
    );

    if (alreadyActive) {
      Alert.alert('Already Active', 'You already have this protocol active.');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // First, ensure the protocol exists in protocols table
      // (In a real app, you'd seed the DB or create protocols on first use)
      const protocolData = {
        name: selectedProtocol.name,
        category: selectedProtocol.category,
        description: selectedProtocol.description,
        difficulty: selectedProtocol.difficulty,
        duration_days: selectedProtocol.duration_days,
        target_hormones: selectedProtocol.target_hormones,
        instructions: selectedProtocol.instructions,
        expected_results: selectedProtocol.expected_results,
        icon: selectedProtocol.icon,
      };

      // Upsert protocol
      const { data: protocolRecord, error: protocolError } = await supabase
        .from('protocols')
        .upsert(protocolData, { onConflict: 'name' })
        .select()
        .single();

      if (protocolError) throw protocolError;

      // Create user_protocol entry
      const { error: userProtocolError } = await supabase
        .from('user_protocols')
        .insert({
          user_id: user.id,
          protocol_id: protocolRecord.id,
          status: 'active',
        });

      if (userProtocolError) throw userProtocolError;

      Alert.alert(
        'Protocol Started! 🎉',
        `${selectedProtocol.name} is now active. Check back daily to track your progress.`
      );

      setShowDetail(false);
      loadActiveProtocols();
    } catch (error) {
      console.error('Error starting protocol:', error);
      Alert.alert('Error', 'Failed to start protocol. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProtocols = filter === 'all' 
    ? PROTOCOL_LIBRARY 
    : PROTOCOL_LIBRARY.filter(p => p.category === filter);

  const categories: FilterType[] = ['all', 'sleep', 'stress', 'exercise', 'nutrition', 'supplements', 'lifestyle'];

  const handleStopProtocol = async (userProtocolId: string) => {
    Alert.alert(
      'Stop Protocol?',
      'Are you sure you want to stop this protocol?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('user_protocols')
                .update({ status: 'stopped', completed_at: new Date().toISOString() })
                .eq('id', userProtocolId);
              
              loadActiveProtocols();
              Alert.alert('Protocol Stopped', 'You can start it again anytime.');
            } catch (error) {
              console.error('Error stopping protocol:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Protocols</Text>
        <Text style={styles.subtitle}>
          Evidence-based protocols to optimize your hormones
        </Text>
      </View>

      {/* Active Protocols */}
      {activeProtocols.length > 0 && (
        <View style={styles.activeSection}>
          <Text style={styles.activeSectionTitle}>
            🔥 Active Protocols ({activeProtocols.length})
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeScrollContainer}
          >
            {activeProtocols.map((up) => {
              const protocol = PROTOCOL_LIBRARY.find(p => p.name === up.protocol?.name);
              if (!protocol) return null;

              const daysActive = Math.floor(
                (Date.now() - new Date(up.started_at).getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <View key={up.id} style={[styles.activeCard, { borderLeftColor: getCategoryColor(protocol.category) }]}>
                  <Text style={styles.activeCardIcon}>{protocol.icon}</Text>
                  <Text style={styles.activeCardName} numberOfLines={2}>{protocol.name}</Text>
                  <View style={styles.activeCardProgress}>
                    <Text style={styles.activeCardProgressText}>
                      Day {daysActive + 1} / {protocol.duration_days}
                    </Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { 
                            width: `${Math.min(100, ((daysActive + 1) / protocol.duration_days) * 100)}%`,
                            backgroundColor: getCategoryColor(protocol.category)
                          }
                        ]} 
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.stopButton}
                    onPress={() => handleStopProtocol(up.id)}
                  >
                    <Text style={styles.stopButtonText}>Stop</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterButton,
              filter === cat && styles.filterButtonActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilter(cat);
            }}
          >
            <Text style={[
              styles.filterText,
              filter === cat && styles.filterTextActive
            ]}>
              {cat === 'all' ? 'All' : `${getCategoryIcon(cat)} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Protocol List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredProtocols.map((protocol, index) => (
          <ProtocolCard
            key={index}
            protocol={protocol}
            onPress={() => handleProtocolPress(protocol)}
          />
        ))}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={showDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetail(false)}
      >
        {selectedProtocol && (
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowDetail(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>← Back</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalHero}>
                <Text style={styles.modalIcon}>{selectedProtocol.icon}</Text>
                <Text style={styles.modalTitle}>{selectedProtocol.name}</Text>
                <View style={styles.modalBadges}>
                  <View style={[styles.badge, { backgroundColor: getCategoryColor(selectedProtocol.category) }]}>
                    <Text style={styles.badgeText}>{selectedProtocol.category}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>⏱️ {selectedProtocol.duration_days} days</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.bodyText}>{selectedProtocol.description}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Target Hormones</Text>
                <View style={styles.hormonesList}>
                  {selectedProtocol.target_hormones.map((h, i) => (
                    <View key={i} style={styles.hormoneTag}>
                      <Text style={styles.hormoneText}>
                        {h === 'cortisol' ? '💧 Cortisol' : h === 'testosterone' ? '⚡ Testosterone' : '🔥 DHEA'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {selectedProtocol.instructions.daily && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Daily Instructions</Text>
                  {selectedProtocol.instructions.daily.map((instruction, i) => (
                    <View key={i} style={styles.listItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bodyText}>{instruction}</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedProtocol.instructions.weekly && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Weekly Instructions</Text>
                  {selectedProtocol.instructions.weekly.map((instruction, i) => (
                    <View key={i} style={styles.listItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bodyText}>{instruction}</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedProtocol.instructions.tips && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tips</Text>
                  {selectedProtocol.instructions.tips.map((tip, i) => (
                    <View key={i} style={styles.listItem}>
                      <Text style={styles.bullet}>💡</Text>
                      <Text style={styles.bodyText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Expected Results</Text>
                <Text style={styles.bodyText}>{selectedProtocol.expected_results}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.startButton,
                  { backgroundColor: getCategoryColor(selectedProtocol.category) },
                  loading && styles.startButtonDisabled
                ]}
                onPress={handleStartProtocol}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.startButtonText}>Start Protocol 🚀</Text>
                )}
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  activeSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  activeSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  activeScrollContainer: {
    gap: 16,
    paddingRight: 16,
  },
  activeCard: {
    width: 200,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderLeftWidth: 4,
  },
  activeCardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  activeCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    minHeight: 40,
  },
  activeCardProgress: {
    marginBottom: 12,
  },
  activeCardProgressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stopButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  filterContainer: {
    padding: 16,
    paddingTop: 20,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  modal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalHero: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F9FAFB',
  },
  modalIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
    textAlign: 'center',
  },
  modalBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
  },
  hormonesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hormoneTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  hormoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingRight: 16,
  },
  bullet: {
    fontSize: 15,
    marginRight: 12,
    color: '#9CA3AF',
    minWidth: 20,
  },
  startButton: {
    margin: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

