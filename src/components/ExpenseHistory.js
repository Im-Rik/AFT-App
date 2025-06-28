import React, { useMemo } from 'react';
import { SectionList, Text, View, StyleSheet } from 'react-native';
import ExpenseCard from './ExpenseCard';

const ExpenseHistory = ({ expenses, isRefreshing, onRefresh }) => {
  // --- [NEW] Group expenses by date using useMemo for efficiency ---
  const sections = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return [];
    }
    
    // Group transactions by date (e.g., '2025-06-28')
    const grouped = expenses.reduce((acc, tx) => {
      const dateKey = tx.date.split(' ')[0]; // Extract date part from 'yyyy-mm-dd HH:MM:ss'
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(tx);
      return acc;
    }, {});

    // Sort the dates so the newest are first, then map to SectionList format
    return Object.keys(grouped)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(date => ({
        title: date,
        // [NEW] Sort expenses within each day to show the newest first
        data: grouped[date].sort((a, b) => new Date(b.date) - new Date(a.date)),
      }));
  }, [expenses]);

  // --- [NEW] Function to render the date headers ---
  const renderSectionHeader = ({ section: { title } }) => {
    const date = new Date(title + 'T12:00:00Z'); // Add time to avoid timezone issues
    const formattedDate = date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    return <Text style={styles.sectionHeader}>{formattedDate}</Text>;
  };

  return (
    // --- [MODIFICATION] Changed from FlatList to SectionList ---
    <SectionList
      sections={sections}
      keyExtractor={(item, index) => item.id + index}
      renderItem={({ item }) => <ExpenseCard expense={item} />}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses logged yet.</Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
      onRefresh={onRefresh}
      refreshing={isRefreshing}
    />
  );
};

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 120,
    },
    // --- [NEW] Style for the date header ---
    sectionHeader: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#cbd5e1', // slate-300
      marginTop: 24,
      marginBottom: 12,
      paddingLeft: 4, // Align with cards
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16,
    },
});

export default ExpenseHistory;