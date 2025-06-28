import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const PaymentCard = ({ payment, currentUserId }) => {
  const isSent = payment.paidByUserId === currentUserId;

  const otherPersonName = isSent ? payment.paidToUserName : payment.paidByUserName;
  const actionText = isSent ? 'You sent a payment' : 'You received a payment';

  const date = new Date(payment.date);
  const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <View style={styles.card}>
      {/* Left Icon */}
      {/* --- [MODIFICATION] Colors are now inversed --- */}
      <View style={[styles.iconContainer, isSent ? styles.receivedIconBg : styles.sentIconBg]}>
        <Icon 
          name={isSent ? 'arrow-up-outline' : 'arrow-down-outline'} 
          size={26} 
          color={'#fff'} 
        />
      </View>

      {/* Center Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.nameText}>{otherPersonName}</Text>
        <Text style={styles.subtitleText}>{actionText}</Text>
        
        {payment.note && (
            <View style={styles.noteContainer}>
                <Icon name="chatbubble-ellipses-outline" size={14} color={styles.noteText.color} />
                <Text style={styles.noteText} numberOfLines={2}>{payment.note}</Text>
            </View>
        )}
      </View>

      {/* Right Amount */}
      <View style={styles.amountContainer}>
        {/* --- [MODIFICATION] Colors inversed and +/- signs removed --- */}
        <Text style={[styles.amountText, isSent ? styles.receivedAmount : styles.sentAmount]}>
          ₹{payment.amount.toFixed(2)}
        </Text>
        <Text style={styles.timeText}>{time}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sentIconBg: {
    backgroundColor: '#ef4444', // Red
  },
  receivedIconBg: {
    backgroundColor: '#22c55e', // Green
  },
  detailsContainer: {
    flex: 1,
  },
  nameText: {
    color: '#f1f5f9',
    fontSize: 17,
    fontWeight: 'bold',
  },
  subtitleText: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  noteText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontStyle: 'italic',
    flexShrink: 1,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  sentAmount: {
    color: '#f87171', // Red
  },
  receivedAmount: {
    color: '#4ade80', // Green
  },
  timeText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 5,
  },
});

export default PaymentCard;