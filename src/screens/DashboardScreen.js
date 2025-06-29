import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, SafeAreaView, Alert, Vibration } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { getDashboardData, getUsers } from '../api';
import { getQueue, processQueue, getSyncHistory } from '../api/offlineQueue';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // --- 1. IMPORT THE HOOK ---

import AddExpenseModal from '../components/AddExpenseModal';
import SettleUpModal from '../components/SettleUpModal';
import SyncStatusModal from '../components/SyncStatusModal';
import OfflineNotice, { BANNER_HEIGHT } from '../components/OfflineNotice';
import MainTabNavigator from '../navigation/MainTabNavigator';


const CACHED_DATA_KEY = 'cached_dashboard_data';

const DashboardScreen = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isSettleUpModalOpen, setIsSettleUpModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [syncHistory, setSyncHistory] = useState([]);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { user } = useAuth();
  const netInfo = useNetInfo();
  const insets = useSafeAreaInsets(); // --- 2. GET THE INSETS ---
  const isOffline = netInfo.isInternetReachable === false;

  const refreshQueueAndHistoryState = async () => {
    const [q, h] = await Promise.all([getQueue(), getSyncHistory()]);
    setOfflineQueue(q);
    setSyncHistory(h);
  };

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh && !dashboardData) {
      setIsLoading(true);
    }
    setError(null);
    try {
      await processQueue();
      const [data, usersForModals] = await Promise.all([
        getDashboardData(),
        getUsers()
      ]);
      setDashboardData(data);
      setUsers(usersForModals);
      setLastUpdated(new Date());
      await AsyncStorage.setItem(CACHED_DATA_KEY, JSON.stringify({ data, users: usersForModals }));
    } catch (err) {
      const isOfflineError = err.message.includes('Network request failed');
      if (!isOfflineError) {
        setError(err.message);
        Alert.alert("Error", `An unexpected error occurred: ${err.message}`);
      } else {
        console.log("Could not refresh data: currently offline. Using cached data.");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      await refreshQueueAndHistoryState();
    }
  }, [dashboardData]);

  useEffect(() => {
    if (user) {
      const loadInitialData = async () => {
        try {
          const cachedDataJson = await AsyncStorage.getItem(CACHED_DATA_KEY);
          if (cachedDataJson) {
            const { data, users } = JSON.parse(cachedDataJson);
            setDashboardData(data);
            setUsers(users);
          }
        } catch (e) {
          console.error("Failed to load cached data", e);
        } finally {
          setIsLoading(true);
          loadData(false);
        }
      };
      loadInitialData();
    }
  }, [user]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshKey(prevKey => prevKey + 1);
    try { Vibration.vibrate(50); } catch (e) { console.log("Vibration failed", e); }
    loadData(true);
  }, [loadData]);

  const handleSave = () => {
    // The modal now closes itself, so we just need to refresh the data
    onRefresh();
  };

  if (isLoading && !dashboardData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  if (error && !dashboardData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={() => loadData(false)} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {dashboardData && (
        <MainTabNavigator
          data={dashboardData}
          openSettleUpModal={() => setIsSettleUpModalOpen(true)}
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          lastUpdated={lastUpdated}
          queue={offlineQueue}
          onOpenSyncStatus={() => {
            refreshQueueAndHistoryState();
            setIsSyncModalOpen(true);
          }}
          // --- 3. PASS THE BOTTOM INSET AS A PROP ---
          safeAreaBottom={insets.bottom}
        />
      )}

      <OfflineNotice isOffline={isOffline} />

      <SyncStatusModal
        visible={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        queue={offlineQueue}
        history={syncHistory}
      />

      <View style={[
        styles.fabContainer,
        // Lift the button when the offline notice is visible
        { bottom: (isOffline ? 80 + BANNER_HEIGHT : 80) + insets.bottom }
      ]}>
        {user?.role === 'admin' && (
          <TouchableOpacity
            onPress={() => setIsAddExpenseModalOpen(true)}
            disabled={isLoading || !user}
            style={[
              styles.addFab,
              (isLoading || !user) && styles.addFabDisabled
            ]}
          >
            <Icon name="add-outline" size={36} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <SettleUpModal
        visible={isSettleUpModalOpen}
        onClose={() => setIsSettleUpModalOpen(false)}
        users={users}
        onSave={handleSave}
      />
      
      <AddExpenseModal
          visible={isAddExpenseModalOpen}
          onClose={() => setIsAddExpenseModalOpen(false)}
          users={users}
          onSave={handleSave}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0f172a',
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#0f172a',
      padding: 20,
    },
    loadingText: {
      marginTop: 10,
      color: '#94a3b8',
      fontSize: 16,
    },
    errorText: {
      color: '#f87171',
      fontSize: 18,
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: '#0d9488',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    fabContainer: {
      position: 'absolute',
      // The `bottom` value is now applied dynamically above
      right: 10,
    },
    addFab: {
      backgroundColor: '#0d9488',
      width: 64,
      height: 64,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    addFabDisabled: {
      backgroundColor: '#1f2937',
      opacity: 0.5,
    }
});

export default DashboardScreen;