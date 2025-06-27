import React from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import BalancesContent from '../../components/BalancesContent';

const BalancesScreen = ({ balances, openSettleUpModal, isRefreshing, onRefresh }) => {
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
        />
      }
    >
      <BalancesContent balances={balances} openSettleUpModal={openSettleUpModal} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120, 
  }
});

export default BalancesScreen;