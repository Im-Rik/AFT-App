import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UserAvatar from './UserAvatar';
import Icon from 'react-native-vector-icons/Ionicons';

const PaymentCard = ({ payment, currentUserId }) => {
  const isSent = payment.paidByUserId === currentUserId;

  const fromUser = isSent ? "You" : payment.paidByUserName;
  const toUser = isSent ? payment.paidToUserName : "you";

  const date = new Date(payment.date);
  const time = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <View style={styles.card}>
      <View style={styles.leftContainer}>
        <UserAvatar name={payment.paidByUserName} size="md" />
        <View style={styles.flowContainer}>
          <View style={isSent ? styles.sentBar : styles.receivedBar} />
          <Icon name="arrow-forward-outline" size={20} color={isSent ? styles.sentAmount.color : styles.receivedAmount.color} />
        </View>
        <UserAvatar name={payment.paidToUserName} size="md" />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.descriptionText}>
          <Text style={{ fontWeight: 'bold' }}>{fromUser}</Text>
          <Text> paid </Text>
          <Text style={{ fontWeight: 'bold' }}>{toUser}</Text>
        </Text>
        {payment.note && (
            <Text style={styles.noteText} numberOfLines={1}>Note: "{payment.note}"</Text>
        )}
      </View>

      <View style={styles.amountContainer}>
        <Text style={[styles.amountText, isSent ? styles.sentAmount : styles.receivedAmount]}>
          {isSent ? '-' : '+'}₹{payment.amount.toFixed(2)}
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
    backgroundColor: '#1e293b', // slate-800
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  flowContainer: {
    alignItems: 'center',
    marginHorizontal: -4,
  },
  sentBar: {
    height: 2,
    width: 24,
    backgroundColor: '#f87171', // red-400
    marginBottom: 2,
  },
  receivedBar: {
    height: 2,
    width: 24,
    backgroundColor: '#4ade80', // green-400
    marginBottom: 2,
  },
  detailsContainer: {
    flex: 1,
  },
  descriptionText: {
    color: '#f1f5f9', // slate-100
    fontSize: 15,
  },
  noteText: {
    color: '#94a3b8', // slate-400
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sentAmount: {
    color: '#f87171', // red-400
  },
  receivedAmount: {
    color: '#4ade80', // green-400
  },
  timeText: {
    color: '#64748b', // slate-500
    fontSize: 12,
    marginTop: 4,
  },
});

export default PaymentCard;