import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import ExpenseCard from './ExpenseCard';

const ExpenseHistory = ({ expenses }) => {
  return (
    <FlatList
      data={[...expenses].reverse()} // Show newest first
      keyExtractor={item => item.id}
      renderItem={({ item }) => <ExpenseCard expense={item} />}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses logged yet.</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
    listContent: {
        padding: 16,
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