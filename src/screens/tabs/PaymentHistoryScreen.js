import React from 'react';
import { View, StyleSheet } from 'react-native';
import PaymentHistory from '../../components/PaymentHistory';

const PaymentHistoryScreen = ({ payments, isRefreshing, onRefresh, lastUpdated }) => {
  return (
    <View style={styles.container}>
      <PaymentHistory 
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

export default PaymentHistoryScreen;