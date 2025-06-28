import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView, SectionList, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatDistanceToNow } from 'date-fns';

const SyncStatusModal = ({ visible, onClose, queue, history }) => {

  const sections = useMemo(() => {
    const data = [];
    if (queue && queue.length > 0) {
      data.push({ title: 'Pending Uploads', data: queue });
    }
    if (history && history.length > 0) {
      data.push({ title: 'Recently Synced', data: history });
    }
    return data;
  }, [queue, history]);

  const renderItem = ({ item }) => {
    const isPending = item.status === 'pending';
    const timeToDisplay = isPending ? item.timestamp : item.syncedAt;
    
    return (
      <View style={styles.itemContainer}>
        <View style={[styles.iconContainer, isPending ? styles.iconPending : styles.iconSuccess]}>
          <Icon name={isPending ? "cloud-upload-outline" : "checkmark-circle-outline"} size={24} color="#fff" />
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemText}>
            {item.endpoint === '/api/expenses' ? 'Expense: ' : 'Payment: '}
            {item.payload.description || `₹${item.payload.amount}`}
          </Text>
          <Text style={styles.itemTimestamp}>
            {isPending ? 'Queued' : 'Synced'} {formatDistanceToNow(new Date(timeToDisplay), { addSuffix: true })}
          </Text>
        </View>
        {isPending && <ActivityIndicator size="small" color="#94a3b8" />}
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sync Status</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close-outline" size={32} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="cloud-done-outline" size={60} color="#4ade80" />
                <Text style={styles.emptyText}>No pending or recent activity.</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  modalContent: { backgroundColor: '#1e293b', height: '60%', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerTitle: { color: '#f1f5f9', fontSize: 22, fontWeight: 'bold' },
  sectionHeader: { color: '#94a3b8', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 20, marginBottom: 10 },
  emptyContainer: { flex: 1, paddingTop: '20%', alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 16, marginTop: 16 },
  itemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', padding: 12, borderRadius: 10, marginBottom: 10 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  iconPending: { backgroundColor: '#f97316' }, // Orange for pending
  iconSuccess: { backgroundColor: '#22c55e' }, // Green for success
  itemDetails: { flex: 1, marginHorizontal: 12 },
  itemText: { color: '#f1f5f9', fontSize: 15, fontWeight: '500' },
  itemTimestamp: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
});

export default SyncStatusModal;