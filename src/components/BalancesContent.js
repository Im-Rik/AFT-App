import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import UserAvatar from './UserAvatar';

const BalancesContent = ({ balances, openSettleUpModal }) => {
  const { youOwe, youAreOwed, groupDebts, groupSettlements } = balances;
  const [view, setView] = useState('simplified');

  const BreakdownItem = ({ person, amount }) => (
    <View style={styles.breakdownItem}>
      <UserAvatar name={person} size="sm" />
      <Text style={styles.breakdownPerson}>{person}</Text>
      <Text style={styles.breakdownAmount}>₹{amount.toFixed(2)}</Text>
    </View>
  );

  const DebtItem = ({ from, to, amount }) => (
    <View style={styles.debtItem}>
      <View>
        <Text style={styles.debtText}>
          <Text style={styles.oweName}>{from},</Text>
          <Text style={styles.owesText}> give </Text>
          <Text style={styles.getName}>{to}</Text>
        </Text>
      </View>
      <Text style={styles.debtAmount}>₹{amount.toFixed(2)}</Text>
    </View>
  );

  // --- The isSettleUpDisabled constant has been removed ---

  return (
    <View style={styles.container}>
      {/* --- You Owe Section --- */}
      <View style={[styles.card, { borderColor: '#f87171' }]}>
        <Text style={styles.cardTitle}>You Owe (Give)</Text>
        <Text style={[styles.cardTotal, { color: '#f87171' }]}>₹{youOwe.total.toFixed(2)}</Text>
        <View style={styles.breakdownContainer}>
          {youOwe.breakdown.map((item, index) => <BreakdownItem key={index} person={item.to} amount={item.amount} />)}
        </View>
        
        {/* --- [MODIFICATION] Button is now always active and has static text/icon --- */}
        <TouchableOpacity 
          style={styles.settleUpButton} 
          onPress={openSettleUpModal}
        >
          <Icon name="cash-outline" size={20} color="#fff" />
          <Text style={styles.settleUpButtonText}>Settle Up</Text>
        </TouchableOpacity>
      </View>

      {/* --- You Are Owed Section (Unchanged) --- */}
      <View style={[styles.card, { borderColor: '#4ade80' }]}>
        <Text style={styles.cardTitle}>You Are Owed (Take)</Text>
        <Text style={[styles.cardTotal, { color: '#4ade80' }]}>₹{youAreOwed.total.toFixed(2)}</Text>
        <View style={styles.breakdownContainer}>
          {youAreOwed.breakdown.map((item, index) => <BreakdownItem key={index} person={item.fromName} amount={item.amount} />)}
        </View>
      </View>

      {/* --- Group Overview Section (Unchanged) --- */}
      <View style={styles.groupCard}>
        <Text style={styles.groupTitle}>Group Overview</Text>
        <View style={styles.segmentedControl}>
          <Pressable onPress={() => setView('simplified')} style={[styles.segmentButton, view === 'simplified' && styles.segmentSelected]}>
            <Text style={styles.segmentText}>Simplified</Text>
          </Pressable>
          <Pressable onPress={() => setView('detailed')} style={[styles.segmentButton, view === 'detailed' && styles.segmentSelected]}>
            <Text style={styles.segmentText}>Detailed Debts</Text>
          </Pressable>
        </View>
        <View style={styles.debtItemsContainer}>
          {(view === 'simplified' ? groupSettlements : groupDebts).map((debt, i) => <DebtItem key={i} from={debt.fromName} to={debt.toName} amount={debt.amount} />)}
          {(view === 'simplified' ? groupSettlements : groupDebts).length === 0 && (
            <Text style={styles.allSettledText}>The whole group is settled up!</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  cardTitle: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardTotal: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  breakdownContainer: {
    gap: 15,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownPerson: {
    color: '#f1f5f9',
    fontSize: 16,
    marginLeft: 12,
  },
  breakdownAmount: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  settleUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  // --- The settleUpButtonDisabled style is no longer needed and has been removed ---
  settleUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
  },
  groupTitle: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  segmentButton: {
    flex: 1,
    padding: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  segmentSelected: {
    backgroundColor: '#475569',
  },
  segmentText: {
    color: '#f1f5f9',
    fontWeight: 'bold',
  },
  debtItemsContainer: {
    gap: 16,
  },
  debtItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#33415550',
    borderRadius: 10,
  },
  debtText: {
    fontSize: 15,
  },
  oweName: {
    color: '#fca5a5',
    fontWeight: '600',
  },
  owesText: {
    color: '#94a3b8',
  },
  getName: {
    color: '#86efac',
    fontWeight: '600',
  },
  debtAmount: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  allSettledText: {
    textAlign: 'center',
    color: '#4ade80',
    padding: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  container: {
    gap: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  cardTitle: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardTotal: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  breakdownContainer: {
    gap: 15,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownPerson: {
    color: '#f1f5f9',
    fontSize: 16,
    marginLeft: 12,
  },
  breakdownAmount: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  // --- END OF NEW AND UPDATED STYLES ---
});

export default BalancesContent;