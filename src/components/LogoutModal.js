import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';

const LogoutModal = ({ visible, onClose, onOpenSyncStatus, queue, lastUpdated }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalBackdrop} onTouchEnd={onClose}>
        <View style={styles.modalContent}>
          {/* User Info */}
          <View style={styles.header}>
            <UserAvatar name={user.name} size="lg" />
            <Text style={styles.userName}>{user.name}</Text>
          </View>

          {/* Sync Status Section */}
          <TouchableOpacity style={styles.statusButton} onPress={onOpenSyncStatus}>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Sync Status</Text>
              <Text style={styles.statusSubtitle}>
                {lastUpdated ? `Last updated: ${format(lastUpdated, 'p')}` : 'Not updated yet'}
              </Text>
            </View>
            <View style={styles.statusIndicator}>
              <Text style={styles.queueCount}>{queue.length}</Text>
              <Icon name="chevron-forward-outline" size={22} color="#94a3b8" />
            </View>
          </TouchableOpacity>
          
          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Icon name="log-out-outline" size={22} color="#f87171" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#1e293b', borderRadius: 16, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  header: { alignItems: 'center', marginBottom: 24, width: '100%' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#f1f5f9', marginTop: 16 },
  statusButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: 16, backgroundColor: '#334155', borderRadius: 12, marginBottom: 12 },
  statusTextContainer: {},
  statusTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: 'bold' },
  statusSubtitle: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  statusIndicator: { flexDirection: 'row', alignItems: 'center' },
  queueCount: { color: '#f1f5f9', backgroundColor: '#0d9488', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8, fontWeight: 'bold' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingVertical: 14, backgroundColor: '#ef444420', borderRadius: 12, marginTop: 12 },
  logoutButtonText: { color: '#f87171', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
});

export default LogoutModal;
