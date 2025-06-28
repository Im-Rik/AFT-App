import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { addPayment } from '../api';
import UserAvatar from './UserAvatar'; // We need this
import { addToQueue } from '../api/offlineQueue';

// Note: For a picker/select dropdown, a library like '@react-native-picker/picker'
// is often used. For simplicity, we'll build a custom one later if needed.
// For now, this modal demonstrates the form logic.

const SettleUpModal = ({ visible, onClose, users, onSave }) => {
  const { user } = useAuth();
  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset form state when modal opens/closes
  useEffect(() => {
    if (!visible) {
      setToUserId('');
      setAmount('');
      setNote('');
      setIsSaving(false);
    }
  }, [visible]);

  const otherUsers = users.filter(u => u.id !== user?.userId);

  const handleSubmit = async () => {
    if (!toUserId || !amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Input', 'Please select who to pay and enter a valid amount.');
      return;
    }

    setIsSaving(true);
    const payload = {
        fromUserId: user.userId,
        toUserId: toUserId,
        amount: parseFloat(amount),
        note: note,
    };

    try {
      await addPayment(payload);
      Alert.alert('Success', 'Payment recorded successfully!');
      onSave();
      onClose();
    } catch (error) {
      // --- [MODIFICATION] Offline queue logic ---
      const isLikelyOffline = error.message.includes('Network request failed');
      if (isLikelyOffline) {
          await addToQueue('/api/payments', payload);
          Alert.alert(
            'Saved Locally', 
            'Your payment has been saved locally and will be uploaded when you are back online.'
          );
          onSave();
          onClose();
      } else {
          Alert.alert('Error', `Failed to save payment: ${error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.headerTitle}>Record a Payment</Text>

          {/* From User */}
          {/* <Text style={styles.label}>You Paid</Text>
          <View style={styles.userDisplay}>
            <UserAvatar name={user?.name} size="md" />
            <Text style={styles.userNameText}>{user?.name}</Text>
          </View> */}
          
          {/* To User (simplified as buttons for mobile UI) */}
          <Text style={styles.label}>Pay To:</Text>
          <View style={styles.userSelectionContainer}>
            {otherUsers.map(u => (
                <TouchableOpacity 
                    key={u.id}
                    onPress={() => setToUserId(u.id)}
                    style={[styles.userChip, toUserId === u.id && styles.userChipSelected]}
                >
                    <UserAvatar name={u.name} size="sm" />
                    <Text style={styles.chipText}>{u.name}</Text>
                </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Amount (₹)"
            placeholderTextColor="#94a3b8"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Note (e.g., 'for dinner')"
            placeholderTextColor="#94a3b8"
            value={note}
            onChangeText={setNote}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} disabled={isSaving} style={[styles.button, styles.saveButton]}>
              {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Payment</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#1e293b', // slate-800
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1f5f9', // slate-100
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#94a3b8', // slate-400
    marginBottom: 8,
  },
  userDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155', // slate-700
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  userNameText: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  userSelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155', // slate-700
    padding: 6,
    paddingRight: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  userChipSelected: {
    borderColor: '#4ade80', // green-400
  },
  chipText: {
    color: '#f1f5f9',
    marginLeft: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#334155',
    color: '#f1f5f9',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#475569', // slate-600
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#0d9488', // teal-600
    marginLeft: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettleUpModal;