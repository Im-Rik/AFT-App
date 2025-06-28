import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar';
import LogoutModal from '../components/LogoutModal';

// Import the screen components for each tab
import BalancesScreen from '../screens/tabs/BalancesScreen';
import AllTransactionsScreen from '../screens/tabs/AllTransactionsScreen';
import ExpenseHistoryScreen from '../screens/tabs/ExpenseHistoryScreen';
import PaymentHistoryScreen from '../screens/tabs/PaymentHistoryScreen';

const Tab = createBottomTabNavigator();

// --- Accept the new 'lastUpdated' prop ---
const MainTabNavigator = ({  data, openSettleUpModal, isRefreshing, onRefresh, lastUpdated, onOpenSyncStatus, queue }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  return (
    <>
      <LogoutModal
        visible={isLogoutModalVisible}
        onClose={() => setIsLogoutModalVisible(false)}
        onOpenSyncStatus={onOpenSyncStatus}
        queue={queue}
        lastUpdated={lastUpdated}
      />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.card, // slate-800
          },
          headerTitleStyle: {
            color: colors.text, // slate-100
            fontSize: 20,
            fontWeight: 'bold',
          },
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => setIsLogoutModalVisible(true)}
              style={{ marginRight: 16 }}
            >
              <UserAvatar name={user?.name} size="md" />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Balances') {
              iconName = focused ? 'scale' : 'scale-outline';
            } else if (route.name === 'Transactions') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Expenses') {
              iconName = focused ? 'receipt' : 'receipt-outline';
            } else if (route.name === 'Payments') {
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary, // green-400
          tabBarInactiveTintColor: '#94a3b8', // slate-400
          tabBarStyle: {
            backgroundColor: colors.card, // slate-800
            borderTopColor: colors.border, // slate-700
            height: 60,
            paddingBottom: 5,
          },
          tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '500',
          },
        })}
      >
        <Tab.Screen name="Balances">
          {() => (
            <BalancesScreen 
              balances={data.balances} 
              openSettleUpModal={openSettleUpModal} 
              isRefreshing={isRefreshing}
              onRefresh={onRefresh}
              // --- Pass down the new prop ---
              lastUpdated={lastUpdated}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Transactions" options={{ title: 'All Transactions' }}>
          {() => (
            <AllTransactionsScreen 
              expenses={data.expenses} 
              payments={data.payments} 
              isRefreshing={isRefreshing}
              onRefresh={onRefresh}
              // --- Pass down the new prop ---
              lastUpdated={lastUpdated}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Expenses" options={{ title: 'Expense History' }}>
          {() => (
            <ExpenseHistoryScreen 
              expenses={data.expenses} 
              isRefreshing={isRefreshing}
              onRefresh={onRefresh}
              // --- Pass down the new prop ---
              lastUpdated={lastUpdated}
            />
          )}
        </Tab.Screen>
         <Tab.Screen name="Payments" options={{ title: 'My Payments' }}>
          {() => (
            <PaymentHistoryScreen 
              payments={data.payments} 
              isRefreshing={isRefreshing}
              onRefresh={onRefresh}
              // --- Pass down the new prop ---
              lastUpdated={lastUpdated}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </>
  );
};

export default MainTabNavigator;