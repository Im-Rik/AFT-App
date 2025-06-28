import React from 'react';
import { View, StyleSheet } from 'react-native';
import AllTransactions from '../../components/AllTransactions';

// --- Accept new props ---
const AllTransactionsScreen = ({ expenses, payments, isRefreshing, onRefresh, lastUpdated }) => {
  return (
    <View style={styles.container}>
      {/* --- Pass props down to the component --- */}
      <AllTransactions 
          expenses={expenses} 
          payments={payments} 
          isRefreshing={isRefreshing} 
          onRefresh={onRefresh}
          lastUpdated={lastUpdated}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AllTransactionsScreen;