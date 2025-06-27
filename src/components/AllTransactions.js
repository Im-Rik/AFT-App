import React, { useMemo } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import UserAvatar from './UserAvatar';
import Icon from 'react-native-vector-icons/Ionicons';

// The helper component for icons remains the same
const CategoryIcon = ({ category }) => {
  let iconName = 'apps-outline';
  let iconColor = '#94a3b8';

  switch (category) {
    case 'Food':
      iconName = 'fast-food-outline';
      iconColor = '#f97316';
      break;
    case 'Transport':
      iconName = 'car-sport-outline';
      iconColor = '#3b82f6';
      break;
    case 'Hotel':
      iconName = 'bed-outline';
      iconColor = '#8b5cf6';
      break;
    case 'Activities':
      iconName = 'tennisball-outline';
      iconColor = '#14b8a6';
      break;
    case 'Shopping':
      iconName = 'cart-outline';
      iconColor = '#ec4899';
      break;
    case 'Payment':
      iconName = 'swap-horizontal-outline';
      iconColor = '#0ea5e9';
      break;
    default:
      iconName = 'receipt-outline';
      iconColor = '#64748b';
  }

  return (
    <View style={styles.iconContainer}>
      <Icon name={iconName} size={28} color={iconColor} />
    </View>
  );
};

const AllTransactions = ({ expenses, payments }) => {
  const sections = useMemo(() => {
    const allTransactions = [
      ...expenses.map(e => ({ ...e, txType: 'expense' })),
      ...payments.map(p => ({ ...p, txType: 'payment', category: 'Payment' })),
    ];
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const grouped = allTransactions.reduce((acc, tx) => {
      // --- FIX #1: DATE PARSING ---
      // The date string from the server uses a space, not a 'T'.
      // We now split by the space to correctly get the date part.
      const dateKey = tx.date.split(' ')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(tx);
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, data]) => ({
      title: date,
      data,
    }));
  }, [expenses, payments]);

  const renderItem = ({ item }) => {
    const isExpense = item.txType === 'expense';
    
    return (
      <View style={styles.card}>
        <CategoryIcon category={item.category} />
        <View style={styles.detailsContainer}>
          <Text style={styles.descriptionText} numberOfLines={1}>{item.description || "Payment"}</Text>
          <Text style={styles.subtitleText}>
            {isExpense ? `Paid by ${item.paidByUserName}` : `${item.paidByUserName} → ${item.paidToUserName}`}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.amountText, isExpense ? styles.expenseAmount : styles.paymentAmount]}>
            {isExpense ? '-' : ''}₹{item.amount.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };
  
  const renderSectionHeader = ({ section: { title } }) => {
    const date = new Date(title + 'T12:00:00Z'); // This now works correctly
    const formattedDate = date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    return <Text style={styles.sectionHeader}>{formattedDate}</Text>;
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.listContentContainer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions have been recorded yet.</Text>
        </View>
      }
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    // --- FIX #2: ADD BOTTOM SPACE ---
    // Added padding to ensure the FAB doesn't cover the last item.
    paddingBottom: 120,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#cbd5e1',
    marginTop: 24,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#334155',
    marginRight: 14,
  },
  detailsContainer: {
    flex: 1,
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  subtitleText: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  amountContainer: {
    marginLeft: 10,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  expenseAmount: {
    color: '#f87171',
  },
  paymentAmount: {
    color: '#4ade80',
  },
  emptyContainer: {
    marginTop: '50%',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  },
});

export default AllTransactions;