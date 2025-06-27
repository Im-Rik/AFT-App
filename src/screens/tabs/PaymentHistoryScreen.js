import React from 'react';
import { View, StyleSheet } from 'react-native';
import PaymentHistory from '../../components/PaymentHistory';

const PaymentHistoryScreen = ({ payments }) => {
  return (
    <View style={styles.container}>
      <PaymentHistory payments={payments} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PaymentHistoryScreen;