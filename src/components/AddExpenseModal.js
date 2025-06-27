import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { addExpense } from '../api';

// --- Form Data (moved from original component) ---
const categories = {
  Food: ['Breakfast', 'Morning snacks', 'Lunch', 'Evening Snacks', 'Dinner', 'Other'],
  Transport: ['Train', '4 wheeler', '2 wheeler', 'Auto', 'Toto', 'Bus', 'Other'],
  Hotel: [],
  Activities: [],
  Shopping: [],
  Other: [],
};
const locations = ['Sealdah', 'NJP', 'Lava', 'Kolakham', 'Tinchuley', 'Siliguri', 'Other'];

const getFoodSubCategoryByTime = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return 'Breakfast';
  if (hour >= 9 && hour < 12) return 'Morning snacks';
  if (hour >= 12 && hour < 15) return 'Lunch';
  if (hour >= 17 && hour < 20) return 'Evening Snacks';
  if (hour >= 20 || hour < 5) return 'Dinner';
  return 'Other';
};

// --- Component ---
const AddExpenseModal = ({ visible, onClose, users, onSave }) => {
  const { user } = useAuth();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [subCategory, setSubCategory] = useState('');
  const [location, setLocation] = useState('');
  const [paidByUserId, setPaidByUserId] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [splitWith, setSplitWith] = useState([]);
  const [exactSplits, setExactSplits] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  const currentSubCategories = useMemo(() => categories[category] || [], [category]);

  // Effect to reset the form when the modal is opened
  useEffect(() => {
    if (visible && user && users.length > 0) {
      setCategory('Food');
      const foodSub = getFoodSubCategoryByTime();
      setSubCategory(foodSub);
      setDescription(foodSub === 'Other' ? '' : foodSub);
      setAmount('');
      setLocation(locations[0]);
      setPaidByUserId(user.userId);
      setSplitType('equal');
      const allUserIds = users.map(u => u.id);
      setSplitWith(allUserIds);
      setExactSplits(users.reduce((acc, u) => ({ ...acc, [u.id]: '' }), {}));
    }
  }, [visible, user, users]);
  
  const handleSubmit = async () => {
    setIsSaving(true);
    try {
        const finalDescription = description || subCategory || category;
        const payload = {
            description: finalDescription,
            amount: parseFloat(amount),
            category,
            subCategory,
            location, // Simplified for this example
            locationFrom: '',
            locationTo: '',
            paidByUserId,
            splitType,
            splits: [],
        };

        if (splitType === 'equal') {
            if (splitWith.length === 0) throw new Error("Please select at least one person to split with.");
            payload.splits = splitWith;
        } else { // 'exact'
            const exactSplitsData = Object.entries(exactSplits)
              .map(([userId, val]) => ({ userId, amount: parseFloat(val) || 0 }))
              .filter(s => s.amount > 0);
            if (exactSplitsData.length === 0) throw new Error("Please enter at least one person's share.");
            const totalSplit = exactSplitsData.reduce((sum, s) => sum + s.amount, 0);
            if (Math.abs(totalSplit - parseFloat(amount)) > 0.01) {
                throw new Error(`Split total (₹${totalSplit.toFixed(2)}) must match the expense amount (₹${parseFloat(amount).toFixed(2)}).`);
            }
            payload.splits = exactSplitsData;
        }

        await addExpense(payload);
        onSave();
        onClose();
    } catch (error) {
        Alert.alert('Save Error', error.message);
    } finally {
        setIsSaving(false);
    }
  };

  const toggleEqualSplitUser = (userId) => {
    setSplitWith(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.headerTitle}>Add New Expense</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category */}
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipContainer}>
                {Object.keys(categories).map(cat => (
                    <TouchableOpacity key={cat} onPress={() => setCategory(cat)} style={[styles.chip, category === cat && styles.chipSelected]}>
                        <Text style={styles.chipText}>{cat}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Amount & Paid By */}
            <View style={styles.row}>
                <View style={{flex: 1, marginRight: 8}}>
                    <Text style={styles.label}>Amount (₹)</Text>
                    <TextInput style={styles.input} placeholder="0.00" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholderTextColor="#94a3b8" />
                </View>
                <View style={{flex: 1, marginLeft: 8}}>
                    <Text style={styles.label}>Paid By</Text>
                     <Text style={styles.paidByText}>{users.find(u => u.id === paidByUserId)?.name || '...'}</Text>
                </View>
            </View>

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.input} placeholder="e.g., 'Dinner at hotel'" value={description} onChangeText={setDescription} placeholderTextColor="#94a3b8" />
            
            {/* Split Method */}
            <Text style={styles.label}>Split Method</Text>
            <View style={styles.segmentedControl}>
                <TouchableOpacity onPress={() => setSplitType('equal')} style={[styles.segmentButton, splitType === 'equal' && styles.segmentSelected]}>
                    <Text style={styles.segmentText}>Equally</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSplitType('exact')} style={[styles.segmentButton, splitType === 'exact' && styles.segmentSelected]}>
                    <Text style={styles.segmentText}>By Exact Amount</Text>
                </TouchableOpacity>
            </View>

            {/* Split With Section */}
            {splitType === 'equal' && (
                <View>
                    <Text style={styles.label}>Split With</Text>
                    <View style={styles.chipContainer}>
                        {users.map(u => (
                            <TouchableOpacity key={u.id} onPress={() => toggleEqualSplitUser(u.id)} style={[styles.chip, splitWith.includes(u.id) && styles.chipSelected]}>
                                <Text style={styles.chipText}>{u.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
            {splitType === 'exact' && (
                <View>
                     <Text style={styles.label}>Split by Exact Amounts</Text>
                     {users.map(u => (
                         <View key={u.id} style={styles.exactSplitRow}>
                             <Text style={styles.exactSplitName}>{u.name}</Text>
                             <TextInput 
                                style={styles.exactSplitInput} 
                                placeholder="₹ 0.00"
                                placeholderTextColor="#94a3b8"
                                keyboardType="numeric"
                                value={exactSplits[u.id] || ''}
                                onChangeText={text => setExactSplits(prev => ({...prev, [u.id]: text}))}
                             />
                         </View>
                     ))}
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={onClose} style={[styles.actionButton, styles.cancelButton]}>
                <Text style={styles.actionButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} disabled={isSaving} style={[styles.actionButton, styles.saveButton]}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>Save Expense</Text>}
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Styles are extensive for this component
const styles = StyleSheet.create({
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
    modalContent: { backgroundColor: '#1e293b', paddingHorizontal: 20, paddingTop: 20, height: '95%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 14, color: '#94a3b8', marginBottom: 8, marginTop: 12 },
    input: { backgroundColor: '#334155', color: '#f1f5f9', padding: 14, borderRadius: 8, fontSize: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    paidByText: { backgroundColor: '#334155', color: '#f1f5f9', padding: 14, borderRadius: 8, fontSize: 16, textAlign: 'center', overflow: 'hidden' },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: { backgroundColor: '#334155', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#475569' },
    chipSelected: { backgroundColor: '#0d9488', borderColor: '#14b8a6' },
    chipText: { color: '#f1f5f9', fontWeight: '600' },
    segmentedControl: { flexDirection: 'row', backgroundColor: '#334155', borderRadius: 8, padding: 2 },
    segmentButton: { flex: 1, padding: 10, borderRadius: 6, alignItems: 'center' },
    segmentSelected: { backgroundColor: '#475569' },
    segmentText: { color: '#f1f5f9', fontWeight: 'bold' },
    exactSplitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, backgroundColor: '#334155', padding: 8, borderRadius: 8 },
    exactSplitName: { color: '#f1f5f9', fontSize: 16, flex: 1 },
    exactSplitInput: { backgroundColor: '#1e293b', color: '#f1f5f9', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, fontSize: 16, width: 120, textAlign: 'right' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32, paddingBottom: 20 },
    actionButton: { flex: 1, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
    cancelButton: { backgroundColor: '#475569', marginRight: 8 },
    saveButton: { backgroundColor: '#0d9488', marginLeft: 8 },
    actionButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});

export default AddExpenseModal;