import React from 'react';
import { View, StyleSheet } from 'react-native';
import AllTransactions from '../../components/AllTransactions';

const AllTransactionsScreen = ({ expenses, payments }) => {
  return (
    <View style={styles.container}>
      <AllTransactions expenses={expenses} payments={payments} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AllTransactionsScreen;