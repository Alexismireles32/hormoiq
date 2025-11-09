import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useAdmin } from '@/contexts/AdminContext';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  created_at: string;
  is_admin: boolean;
  onboarding_completed: boolean;
  age?: number;
  gender?: string;
}

export default function AdminUsers() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!adminLoading) {
      if (!isAdmin) {
        Alert.alert('Access Denied', 'You do not have admin permissions.');
        router.back();
      } else {
        loadUsers();
      }
    }
  }, [isAdmin, adminLoading]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, created_at, is_admin, onboarding_completed, age, gender')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers((data as User[]) || []);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    Alert.alert(
      currentStatus ? 'Remove Admin' : 'Make Admin',
      `Are you sure you want to ${currentStatus ? 'remove admin privileges from' : 'grant admin privileges to'} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('users')
                .update({ is_admin: !currentStatus })
                .eq('id', userId);

              if (error) throw error;

              Alert.alert('Success', 'Admin status updated');
              loadUsers();
            } catch (error) {
              console.error('Error updating admin status:', error);
              Alert.alert('Error', 'Failed to update admin status');
            }
          },
        },
      ]
    );
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.subtitle}>{users.length} total users</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>

      {/* User List */}
      <ScrollView style={styles.scrollView}>
        {filteredUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userMeta}>
                  {user.age && `${user.age} y/o`} {user.gender && `• ${user.gender}`}
                </Text>
                <Text style={styles.userDate}>
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </Text>
              </View>
              {user.is_admin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  user.is_admin ? styles.removeAdminButton : styles.makeAdminButton,
                ]}
                onPress={() => handleToggleAdmin(user.id, user.is_admin)}
              >
                <Text style={styles.actionButtonText}>
                  {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.viewButton]}
                onPress={() => {
                  Alert.alert(
                    'User Details',
                    `ID: ${user.id}\nEmail: ${user.email}\nOnboarding: ${user.onboarding_completed ? 'Complete' : 'Incomplete'}`
                  );
                }}
              >
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredUsers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No users found</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  userDate: {
    fontSize: 12,
    color: '#999',
  },
  adminBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  userActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  makeAdminButton: {
    backgroundColor: '#10B981',
  },
  removeAdminButton: {
    backgroundColor: '#EF4444',
  },
  viewButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
});

