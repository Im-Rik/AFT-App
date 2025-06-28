import React, { useMemo } from 'react';
import { SectionList, View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import PaymentCard from './PaymentCard';

const PaymentHistory = ({ payments, isRefreshing, onRefresh, lastUpdated }) => {
  const { user } = useAuth();
  
  const sections = useMemo(() => {
    const myPayments = payments
      .filter(p => p.paidByUserId === user.userId || p.paidToUserId === user.userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const grouped = myPayments.reduce((acc, tx) => {
      const dateKey = tx.date.split(' ')[0];
      if (!acc[dateKey]) { acc[dateKey] = []; }
      acc[dateKey].push(tx);
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, data]) => ({ title: date, data }));
  }, [payments, user.userId]);

  const renderSectionHeader = ({ section: { title } }) => {
    const date = new Date(title + 'T12:00:00Z');
    const formattedDate = date.toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    return <Text style={styles.sectionHeader}>{formattedDate}</Text>;
  };

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PaymentCard payment={item} currentUserId={user.userId} />}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.listContentContainer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You haven't made or received any payments yet.</Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
      // --- [IMPLEMENTATION] Add refresh control props ---
      onRefresh={onRefresh}
      refreshing={isRefreshing}
    />
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#cbd5e1',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyContainer: {
    marginTop: '50%',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  },
});

export default PaymentHistory;