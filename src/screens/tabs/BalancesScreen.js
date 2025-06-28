import React from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import BalancesContent from '../../components/BalancesContent';

const BalancesScreen = ({ balances, openSettleUpModal, isRefreshing, onRefresh, lastUpdated }) => {
  
  // --- [ENHANCEMENT] Format the last updated time for display ---
  const lastUpdatedTitle = lastUpdated 
    ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
    : 'Pull to refresh';

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor="#cbd5e1" // slate-300
          title={lastUpdatedTitle}
          titleColor="#94a3b8" // slate-400
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