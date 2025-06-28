import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Animated,
  Dimensions,
  Pressable,
  Easing,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { addExpense } from '../api';
import { addToQueue } from '../api/offlineQueue';
import Icon from 'react-native-vector-icons/Ionicons';

// --- Data and Helpers ---
const categories = {
    Food: ['Breakfast', 'Morning snacks', 'Lunch', 'Evening Snacks', 'Dinner', 'Other'],
    Transport: ['Train', '4 wheeler', '2 wheeler', 'Auto', 'Toto', 'Bus', 'Other'],
    Hotel: [], Activities: [], Shopping: [], Other: [],
};
const locations = ['Sealdah', 'NJP', 'Lava', 'Kolakham', 'Tinchuley', 'Siliguri', 'Other'];
const { height: screenHeight } = Dimensions.get('window');

const getFoodSubCategoryByTime = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 9) return 'Breakfast';
    if (hour >= 9 && hour < 12) return 'Morning snacks';
    if (hour >= 12 && hour < 15) return 'Lunch';
    if (hour >= 17 && hour < 20) return 'Evening Snacks';
    if (hour >= 20 || hour < 5) return 'Dinner';
    return 'Other';
};

// --- Main Component ---
const AddExpenseModal = ({ visible, onClose, users, onSave }) => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [subCategory, setSubCategory] = useState('');
  const [location, setLocation] = useState('');
  const [otherLocation, setOtherLocation] = useState('');
  const [locationFrom, setLocationFrom] = useState('');
  const [locationTo, setLocationTo] = useState('');
  const [paidByUserId, setPaidByUserId] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [splitWith, setSplitWith] = useState([]);
  const [exactSplits, setExactSplits] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  const slideAnimation = useRef(new Animated.Value(screenHeight)).current;

   useEffect(() => {
    // This timeout ensures the modal is fully mounted before the animation starts,
    // preventing the "sudden" appearance.
    const timer = setTimeout(() => {
      if (visible) {
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      }
    }, 10); // A very short delay is all that's needed

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [visible, slideAnimation]);

  const handleClose = () => {
    Animated.timing(slideAnimation, {
      toValue: screenHeight,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };
  
  const isLoading = !users || users.length === 0;

  const exactSplitTotal = useMemo(() => {
    return Object.values(exactSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [exactSplits]);

  const currentSubCategories = useMemo(() => categories[category] || [], [category]);
  const showDescriptionInput = useMemo(() => {
    return subCategory === 'Other' || (currentSubCategories.length === 0 && category !== 'Hotel');
  }, [subCategory, currentSubCategories, category]);

  useEffect(() => {
    if (visible && user && users.length > 0) {
        setCategory('Food'); setAmount(''); setDescription('');
        setPaidByUserId(user.userId); setLocation(locations[0]);
        setLocationFrom(locations[0]); setLocationTo(locations[1]);
        setOtherLocation(''); setSplitType('equal');
        setSplitWith(users.map(u => u.id));
        setExactSplits(users.reduce((acc, u) => ({ ...acc, [u.id]: '' }), {}));
    }
  }, [visible, user, users]);

  useEffect(() => {
    let newSubCategory;
    if (category === 'Food') newSubCategory = getFoodSubCategoryByTime();
    else if (currentSubCategories.length > 0) newSubCategory = currentSubCategories[0];
    else newSubCategory = '';
    setSubCategory(newSubCategory);
  }, [category, currentSubCategories]);

  useEffect(() => {
    if (!showDescriptionInput && subCategory) setDescription(subCategory);
    else if (subCategory === 'Other' || category === 'Hotel') setDescription('');
  }, [subCategory, showDescriptionInput, category]);

  const handleExactSplitChange = (userId, value) => {
    setExactSplits(prev => ({ ...prev, [userId]: value }));
  };

  // --- BUG FIX: Correctly add the userId to the array ---
  const toggleEqualSplitUser = (userId) => {
    setSplitWith(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    let payload;
    try {
        const finalDescription = description || subCategory || category;
        const finalLocation = location === 'Other' ? otherLocation : location;
        const finalAmount = splitType === 'exact' ? exactSplitTotal : parseFloat(amount);
        if (!finalAmount || finalAmount <= 0) {
            throw new Error("Expense amount must be greater than zero.");
        }
        const locationData = category === 'Transport'
            ? { location: '', locationFrom, locationTo }
            : { location: finalLocation, locationFrom: '', locationTo: '' };
        const commonPayload = {
            description: finalDescription, amount: finalAmount, category,
            subCategory, ...locationData, paidByUserId,
        };
        if (splitType === 'equal') {
            if (splitWith.length === 0) throw new Error("Please select at least one person to split with equally.");
            payload = { ...commonPayload, splitType, splits: splitWith };
        } else {
            const splits = Object.entries(exactSplits)
              .map(([userId, val]) => ({ userId, amount: parseFloat(val) || 0 }))
              .filter(s => s.amount > 0);
            if (splits.length === 0) throw new Error("Please enter at least one person's share for an exact split.");
            payload = { ...commonPayload, splitType, splits };
        }
        await addExpense(payload);
        Alert.alert('Success', 'Expense added successfully!');
        onSave();
        handleClose();
    } catch (error) {
        const isLikelyOffline = error.message.includes('Network request failed');
        if (isLikelyOffline && payload) {
            await addToQueue('/api/expenses', payload);
            Alert.alert('Saved Locally', 'Your expense has been saved locally and will be uploaded when you are back online.');
            onSave();
            handleClose();
        } else {
            Alert.alert('Save Error', error.message);
        }
    } finally {
        setIsSaving(false);
    }
  };

  const isAmountDisabled = splitType === 'exact';

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <Animated.View style={[styles.modalContainer, { transform: [{ translateY: slideAnimation }] }]}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Add New Expense</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Icon name="close-circle" size={30} color="#94a3b8" />
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
              {isLoading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#14b8a6" />
                  <Text style={styles.loaderText}>Loading members...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.section}><Text style={styles.label}>Category</Text><View style={styles.chipContainer}>{Object.keys(categories).map(c => (<TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipSelected]}><Text style={[styles.chipText, category === c && styles.chipTextSelected]}>{c}</Text></TouchableOpacity>))}</View></View>
                  {currentSubCategories.length > 0 && ( <View style={styles.section}><Text style={styles.label}>Sub-Category</Text><View style={styles.chipContainer}>{currentSubCategories.map(sc => (<TouchableOpacity key={sc} onPress={() => setSubCategory(sc)} style={[styles.chip, subCategory === sc && styles.chipSelected]}><Text style={[styles.chipText, subCategory === sc && styles.chipTextSelected]}>{sc}</Text></TouchableOpacity>))}</View></View> )}
                  {showDescriptionInput && ( <View style={styles.section}><Text style={styles.label}>Description</Text><TextInput style={styles.input} placeholder="so what is it ...." value={description} onChangeText={setDescription} placeholderTextColor="#94a3b8" /></View> )}
                  <View style={styles.section}>
                    {category === 'Transport' ? ( <View style={styles.row}><View style={styles.flex1}><Text style={styles.label}>From</Text><View style={styles.chipContainer}>{locations.filter(l => l !== 'Other').map(l => (<TouchableOpacity key={l} onPress={() => setLocationFrom(l)} style={[styles.chip, locationFrom === l && styles.chipSelected]}><Text style={[styles.chipText, locationFrom === l && styles.chipTextSelected]}>{l}</Text></TouchableOpacity>))}</View></View><View style={styles.flex1}><Text style={styles.label}>To</Text><View style={styles.chipContainer}>{locations.filter(l => l !== 'Other').map(l => (<TouchableOpacity key={l} onPress={() => setLocationTo(l)} style={[styles.chip, locationTo === l && styles.chipSelected]}><Text style={[styles.chipText, locationTo === l && styles.chipTextSelected]}>{l}</Text></TouchableOpacity>))}</View></View></View>
                    ) : ( <>
                        <Text style={styles.label}>Location</Text>
                        <View style={styles.chipContainer}>{locations.map(l => ( <TouchableOpacity key={l} onPress={() => setLocation(l)} style={[styles.chip, location === l && styles.chipSelected]}><Text style={[styles.chipText, location === l && styles.chipTextSelected]}>{l}</Text></TouchableOpacity>))}
                        </View>
                        {location === 'Other' && ( <TextInput style={[styles.input, styles.otherInput]} placeholder="Specify Location" value={otherLocation} onChangeText={setOtherLocation} placeholderTextColor="#94a3b8" /> )}
                      </>)}
                  </View>
                  <View style={styles.row}>
                    <View style={styles.flex1}><Text style={styles.label}>Paid By</Text><View style={styles.chipContainer}>{users.map(u => (<TouchableOpacity key={u.id} onPress={() => setPaidByUserId(u.id)} style={[styles.chip, paidByUserId === u.id && styles.chipSelected]}><Text style={[styles.chipText, paidByUserId === u.id && styles.chipTextSelected]}>{u.name}</Text></TouchableOpacity>))}</View></View>
                    <View style={styles.flex1}>
                      <Text style={styles.label}>Amount (₹)</Text>
                      <TextInput style={[styles.input, isAmountDisabled && styles.inputDisabled]} keyboardType="decimal-pad" placeholder="0.00" value={isAmountDisabled ? exactSplitTotal.toFixed(2) : amount} onChangeText={setAmount} placeholderTextColor="#94a3b8" editable={!isAmountDisabled}/>
                    </View>
                  </View>
                  <View style={styles.section}><Text style={styles.label}>Split Method</Text><View style={styles.segmentedControl}><TouchableOpacity onPress={() => setSplitType('equal')} style={[styles.segmentButton, splitType === 'equal' && styles.segmentSelected]}><Text style={styles.segmentText}>Equally</Text></TouchableOpacity><TouchableOpacity onPress={() => setSplitType('exact')} style={[styles.segmentButton, splitType === 'exact' && styles.segmentSelected]}><Text style={styles.segmentText}>By Exact Amounts</Text></TouchableOpacity></View></View>
                  <View style={styles.section}>
                    <Text style={styles.label}>Split With</Text>
                    {splitType === 'equal' && (<View style={styles.chipContainer}>{users.map(u => (<TouchableOpacity key={u.id} onPress={() => toggleEqualSplitUser(u.id)} style={[styles.chip, splitWith.includes(u.id) && styles.chipSelected]}><Text style={[styles.chipText, splitWith.includes(u.id) && styles.chipTextSelected]}>{u.name}</Text></TouchableOpacity>))}
                    </View>)}
                    {splitType === 'exact' && (<View style={styles.exactSplitContainer}>{users.map(u => (<View key={u.id} style={styles.exactSplitRow}><Text style={styles.exactSplitName}>{u.name}</Text><TextInput style={styles.exactSplitInput} value={String(exactSplits[u.id] || '')} onChangeText={text => handleExactSplitChange(u.id, text)} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#94a3b8"/></View>))}</View>)}
                  </View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleClose} style={[styles.button, styles.cancelButton]}><Text style={styles.buttonText}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity onPress={handleSubmit} disabled={isSaving} style={[styles.button, styles.saveButton]}>{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Expense</Text>}</TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    // --- STYLE CHANGE: Simplified overlay and explicit positioning for the container ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Moved backdrop color here
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '95%',
        backgroundColor: '#0f172a',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },
    safeArea: { flex: 1, backgroundColor: 'transparent' }, // Make safe area transparent
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#334155' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#f1f5f9' },
    closeButton: { padding: 4 },
    container: { flex: 1 },
    contentContainer: { padding: 16, paddingBottom: 40 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
    loaderText: { marginTop: 16, color: '#94a3b8', fontSize: 16 },
    section: { marginBottom: 24 },
    label: { fontSize: 16, color: '#94a3b8', marginBottom: 12, fontWeight: '500' },
    input: { backgroundColor: '#334155', color: '#f1f5f9', padding: 14, borderRadius: 8, fontSize: 16 },
    inputDisabled: { backgroundColor: '#1e293b', color: '#94a3b8' },
    otherInput: { marginTop: 12 },
    row: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    flex1: { flex: 1 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { backgroundColor: '#334155', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
    chipSelected: { backgroundColor: '#14b8a6', borderColor: '#5eead4' },
    chipText: { color: '#f1f5f9', fontWeight: '600' },
    chipTextSelected: { color: '#fff' },
    segmentedControl: { flexDirection: 'row', backgroundColor: '#334155', borderRadius: 8, padding: 4 },
    segmentButton: { flex: 1, padding: 10, borderRadius: 6, alignItems: 'center' },
    segmentSelected: { backgroundColor: '#475569' },
    segmentText: { color: '#f1f5f9', fontWeight: 'bold' },
    exactSplitContainer: { gap: 8 },
    exactSplitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#334155', padding: 8, borderRadius: 8 },
    exactSplitName: { color: '#f1f5f9', fontSize: 16, fontWeight: '500' },
    exactSplitInput: { backgroundColor: '#1e293b', color: '#f1f5f9', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, fontSize: 16, width: 120, textAlign: 'right' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 16 },
    button: { flex: 1, paddingVertical: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    cancelButton: { backgroundColor: '#475569' },
    saveButton: { backgroundColor: '#0d9488' },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});

export default AddExpenseModal;