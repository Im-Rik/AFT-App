import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UserAvatar from './UserAvatar';

const ExpenseCard = ({ expense }) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.description}>{expense.description}</Text>
          <Text style={styles.category}>{expense.category}</Text>
        </View>
        <Text style={styles.amount}>₹{expense.amount.toFixed(2)}</Text>
      </View>
      {/* Paid By Section */}
      <View style={styles.paidBySection}>
        <UserAvatar name={expense.paidByUserName} size="md" />
        <Text style={styles.paidByText}>Paid by {expense.paidByUserName}</Text>
      </View>
      {/* Split Details Section */}
      {expense.splitDetails?.participants.length > 0 && (
        <View style={styles.splitSection}>
          <Text style={styles.splitTitle}>Split With</Text>
          <View style={styles.participantsContainer}>
            {expense.splitDetails.participants.map(p => (
              <View key={p.userId} style={styles.participant}>
                <UserAvatar name={p.userName} size="sm" />
                <View style={styles.participantDetails}>
                    <Text style={styles.participantName}>{p.userName}</Text>
                    <Text style={styles.participantAmount}>₹{p.amount.toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e293b', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16 },
  headerTextContainer: { flex: 1, marginRight: 8 },
  description: { color: '#f1f5f9', fontSize: 18, fontWeight: 'bold' },
  category: { color: '#5eead4', fontSize: 14, fontWeight: '500', marginTop: 4 },
  amount: { color: '#5eead4', fontSize: 20, fontWeight: 'bold' },
  paidBySection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderColor: '#334155' },
  paidByText: { color: '#cbd5e1', marginLeft: 12, fontSize: 15 },
  splitSection: { padding: 16, backgroundColor: '#0f172a', borderTopWidth: 1, borderColor: '#334155' },
  splitTitle: { color: '#94a3b8', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12 },
  participantsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  participant: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', borderRadius: 20, padding: 6, marginRight: 8, marginBottom: 8 },
  participantDetails: { marginLeft: 8, marginRight: 4 },
  participantName: { color: '#f1f5f9', fontSize: 13, fontWeight: '600' },
  participantAmount: { color: '#5eead4', fontSize: 12 },
});

export default ExpenseCard;