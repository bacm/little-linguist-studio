import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';

const SUPABASE_URL = "https://soqqamkrbcwzimwrkclb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvcXFhbWtyYmN3emltd3JrY2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MDgyODQsImV4cCI6MjA3MTk4NDI4NH0.Sr44SCYO2P9_bA2u-McKXkm1IWhYcaFIWZj-r_ZGdVI";

// Validate configuration
console.log('Supabase Configuration:', {
  url: SUPABASE_URL,
  keyPrefix: SUPABASE_PUBLISHABLE_KEY.substring(0, 20) + '...',
  platform: Platform.OS
});

// Custom storage adapter for React Native
const customStorage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      return localStorage.setItem(key, value);
    }
    return await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.removeItem(key);
    }
    return await AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: customStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
  }
});