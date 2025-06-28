import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UserAvatar from './UserAvatar';
import Icon from 'react-native-vector-icons/Ionicons';

const ExpenseCard = ({ expense }) => {
  // Extract the time from the expense date
  const date = new Date(expense.date);
  const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.description}>{expense.description}</Text>
          <Text style={styles.category}>{expense.category}</Text>
        </View>
        {/* Amount and Time are now grouped on the right */}
        <View style={styles.amountContainer}>
            <Text style={styles.amount}>₹{expense.amount.toFixed(2)}</Text>
            <Text style={styles.timeText}>{time}</Text>
        </View>
      </View>

      {/* Main Divider Line */}
      <View style={styles.mainDivider} />

      {/* Details Section */}
      <View style={styles.detailsContainer}>
        {/* Paid By Section */}
        <View style={styles.paidBySection}>
            <UserAvatar name={expense.paidByUserName} size="md" />
            <Text style={styles.paidByText}>Paid by {expense.paidByUserName}</Text>
        </View>

        {/* Split Details Section */}
        {expense.splitDetails?.participants.length > 0 && (
          <View style={styles.splitSection}>
            <View style={styles.splitTitleContainer}>
              <Icon name="people-outline" size={16} color={styles.splitTitle.color} />
              <Text style={styles.splitTitle}>Split With</Text>
              
              {/* Badge for EVEN splits */}
              {expense.splitDetails?.type === 'even' && (
                <View style={[styles.badge, styles.evenBadge]}>
                  <Text style={styles.badgeText}>Even</Text>
                </View>
              )}

              {/* Badge for UNEVEN splits */}
              {expense.splitDetails?.type === 'uneven' && (
                <View style={[styles.badge, styles.unevenBadge]}>
                  <Text style={styles.badgeText}>Uneven</Text>
                </View>
              )}
            </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#1e293b',
    borderRadius: 16, 
    marginBottom: 16, 
    overflow: 'hidden' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    padding: 16 
  },
  headerTextContainer: { 
    flex: 1, 
    marginRight: 12 
  },
  description: { 
    color: '#f1f5f9', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  category: { 
    color: '#5eead4', 
    fontSize: 14, 
    fontWeight: '500', 
    marginTop: 4 
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: { 
    color: '#f1f5f9', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  timeText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 5,
  },
  mainDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginHorizontal: 16,
  },
  detailsContainer: {
    padding: 16,
  },
  paidBySection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  paidByText: { 
    color: '#cbd5e1', 
    marginLeft: 12, 
    fontSize: 15,
    fontWeight: '500'
  },
  splitSection: { 
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  splitTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  splitTitle: { 
    color: '#94a3b8',
    fontSize: 14, 
    fontWeight: 'bold', 
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  evenBadge: {
    backgroundColor: '#14b8a6',
  },
  unevenBadge: {
    backgroundColor: '#3b82f6',
  },
  participantsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: 8,
  },
  participant: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#334155', 
    borderRadius: 20, 
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  participantDetails: { 
    marginLeft: 8,
  },
  participantName: { 
    color: '#f1f5f9', 
    fontSize: 13, 
    fontWeight: '600' 
  },
  participantAmount: { 
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
});

export default ExpenseCard;