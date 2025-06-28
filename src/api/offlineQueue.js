import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { fetchWithAuth } from './apiClient'; // <-- [MODIFICATION] Import from the new file
import NetInfo from '@react-native-community/netinfo';

const OFFLINE_QUEUE_KEY = 'offline_queue';
const SYNC_HISTORY_KEY = 'sync_history';
const HISTORY_LIMIT = 6;

// --- All functions below this line remain completely unchanged ---

export const getSyncHistory = async () => {
  try {
    const historyJson = await AsyncStorage.getItem(SYNC_HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Failed to get sync history:', error);
    return [];
  }
};

const addToSyncHistory = async (syncedItem) => {
  try {
    let history = await getSyncHistory();
    const historyItem = { ...syncedItem, status: 'success', syncedAt: new Date().toISOString() };
    history.unshift(historyItem);
    const cappedHistory = history.slice(0, HISTORY_LIMIT);
    await AsyncStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(cappedHistory));
  } catch (error) {
    console.error('Failed to add to sync history:', error);
  }
};

export const addToQueue = async (endpoint, payload) => {
  try {
    const queue = await getQueue();
    const newQueueItem = {
      id: uuidv4(),
      endpoint,
      payload,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    queue.push(newQueueItem);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.log('Item added to offline queue.');
    return newQueueItem;
  } catch (error) {
    console.error('Failed to add to offline queue:', error);
  }
};

export const getQueue = async () => {
  try {
    const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Failed to get offline queue:', error);
    return [];
  }
};

export const processQueue = async () => {
  const connection = await NetInfo.fetch();
  if (!connection.isConnected || !connection.isInternetReachable) {
    console.log('Device is offline. Skipping queue processing.');
    return false;
  }
  
  let queue = await getQueue();
  if (queue.length === 0) {
    return false;
  }

  console.log(`Processing offline queue with ${queue.length} item(s)...`);
  
  let itemProcessedSuccessfully = false;
  for (const item of queue) {
    try {
      await fetchWithAuth(item.endpoint, {
        method: 'POST',
        body: JSON.stringify(item.payload),
      });
      
      await addToSyncHistory(item);
      
      const currentQueue = await getQueue();
      const newQueue = currentQueue.filter(i => i.id !== item.id);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
      
      console.log(`Successfully synced item: ${item.payload.description || 'Payment'}`);
      itemProcessedSuccessfully = true;

    } catch (error) {
      console.log(`Failed to sync item, will retry later. Error: ${error.message}`);
      return itemProcessedSuccessfully;
    }
  }
  return itemProcessedSuccessfully;
};