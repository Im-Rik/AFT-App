import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import Icon from 'react-native-vector-icons/Ionicons';

const LogoutModal = ({ visible, onClose }) => {
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
          <View style={styles.header}>
            <UserAvatar name={user.name} size="lg" />
            <Text style={styles.userName}>{user.name}</Text>
            {/* <Text style={styles.userEmail}>{user.email}</Text> */}
          </View>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginTop: 16,
  },
  userEmail: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#ef444420',
    borderRadius: 12,
  },
  logoutButtonText: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default LogoutModal;