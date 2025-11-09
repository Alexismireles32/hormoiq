import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalUsers: number;
  totalTests: number;
  activeProtocols: number;
  testsToday: number;
  newUsersThisWeek: number;
  avgTestsPerUser: number;
}

export default function AdminDashboard() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminLoading) {
      if (!isAdmin) {
        Alert.alert('Access Denied', 'You do not have admin permissions.');
        router.back();
      } else {
        loadStats();
      }
    }
  }, [isAdmin, adminLoading]);

  const loadStats = async () => {
    try {
      // Total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Total tests
      const { count: testCount } = await supabase
        .from('hormone_tests')
        .select('*', { count: 'exact', head: true });

      // Active protocols
      const { count: protocolCount } = await supabase
        .from('user_protocols')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Tests today
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('hormone_tests')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', `${today}T00:00:00`)
        .lt('timestamp', `${today}T23:59:59`);

      // New users this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: newUserCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      setStats({
        totalUsers: userCount || 0,
        totalTests: testCount || 0,
        activeProtocols: protocolCount || 0,
        testsToday: todayCount || 0,
        newUsersThisWeek: newUserCount || 0,
        avgTestsPerUser: userCount ? Math.round((testCount || 0) / userCount) : 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading || loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>System Overview & Management</Text>
      </View>

      {/* Key Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: '#3B82F6' }]}>
            <Text style={styles.metricValue}>{stats?.totalUsers || 0}</Text>
            <Text style={styles.metricLabel}>Total Users</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: '#10B981' }]}>
            <Text style={styles.metricValue}>{stats?.totalTests || 0}</Text>
            <Text style={styles.metricLabel}>Total Tests</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: '#F59E0B' }]}>
            <Text style={styles.metricValue}>{stats?.activeProtocols || 0}</Text>
            <Text style={styles.metricLabel}>Active Protocols</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: '#8B5CF6' }]}>
            <Text style={styles.metricValue}>{stats?.testsToday || 0}</Text>
            <Text style={styles.metricLabel}>Tests Today</Text>
          </View>
        </View>
      </View>

      {/* Secondary Metrics */}
      <View style={styles.section}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.newUsersThisWeek || 0}</Text>
            <Text style={styles.statLabel}>New Users (7d)</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.avgTestsPerUser || 0}</Text>
            <Text style={styles.statLabel}>Avg Tests/User</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/admin/users')}
        >
          <Text style={styles.actionButtonIcon}>👥</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>User Management</Text>
            <Text style={styles.actionButtonSubtitle}>View and manage users</Text>
          </View>
          <Text style={styles.actionButtonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/admin/protocols')}
        >
          <Text style={styles.actionButtonIcon}>📋</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>Protocol Management</Text>
            <Text style={styles.actionButtonSubtitle}>Manage protocol library</Text>
          </View>
          <Text style={styles.actionButtonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/admin/analytics')}
        >
          <Text style={styles.actionButtonIcon}>📊</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>Analytics</Text>
            <Text style={styles.actionButtonSubtitle}>View detailed analytics</Text>
          </View>
          <Text style={styles.actionButtonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Alert.alert('Refresh', 'Refreshing statistics...');
            loadStats();
          }}
        >
          <Text style={styles.actionButtonIcon}>🔄</Text>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonTitle}>Refresh Stats</Text>
            <Text style={styles.actionButtonSubtitle}>Reload all metrics</Text>
          </View>
          <Text style={styles.actionButtonArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* System Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version:</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Database:</Text>
            <Text style={[styles.infoValue, { color: '#10B981' }]}>● Connected</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Admin User:</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
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
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  actionButtonSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  actionButtonArrow: {
    fontSize: 20,
    color: '#999',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
});

