import React from 'react';
import { View, StyleSheet } from 'react-native';
import ExpenseHistory from '../../components/ExpenseHistory';

const ExpenseHistoryScreen = ({ expenses }) => {
  return (
    <View style={styles.container}>
      <ExpenseHistory expenses={expenses} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ExpenseHistoryScreen;