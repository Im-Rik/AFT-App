import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { getDashboardData, getUsers } from '../api';

import MainTabNavigator from '../navigation/MainTabNavigator';
import AddExpenseModal from '../components/AddExpenseModal';
import SettleUpModal from '../components/SettleUpModal';

const DashboardScreen = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isSettleUpModalOpen, setIsSettleUpModalOpen] = useState(false);
  
  // --- ADDED FOR PULL-TO-REFRESH ---
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user } = useAuth();

  const loadData = useCallback(async () => {
    // Don't show the main loading spinner on a pull-to-refresh
    if (!isRefreshing) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const [data, usersForModals] = await Promise.all([
        getDashboardData(),
        getUsers()
      ]);
      setDashboardData(data);
      setUsers(usersForModals);
    } catch (err) {
      setError(err.message);
      Alert.alert("Error", `Could not load data: ${err.message}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false); // Stop the refresh indicator
    }
  }, [isRefreshing]); // Dependency added

  // --- ADDED FOR PULL-TO-REFRESH ---
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    // The loadData function will be called because isRefreshing is in its dependency array,
    // but we can call it explicitly to be sure.
    loadData();
  }, []);


  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);
  
  const handleSave = () => {
      loadData();
  };

  if (isLoading) {
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
        <TouchableOpacity onPress={loadData} style={styles.retryButton}>
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
            // --- PROPS ADDED FOR PULL-TO-REFRESH ---
            isRefreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        )}

        {/* Floating Action Buttons */}
        <View style={styles.fabContainer}>
            {user?.role === 'admin' && (
                <TouchableOpacity onPress={() => setIsAddExpenseModalOpen(true)} style={styles.addFab}>
                    <Icon name="add-outline" size={36} color="#fff" />
                </TouchableOpacity>
            )}
        </View>

        {/* Modals */}
        {users.length > 0 && (
          <>
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
          </>
        )}
    </SafeAreaView>
  );
};

// --- User's updated styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a', // slate-900
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
        bottom: 80, 
        right: 10,
    },
    addFab: {
        backgroundColor: '#0d9488', // teal-600
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
    }
});

export default DashboardScreen;