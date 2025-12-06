import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';

const SUPABASE_URL = "https://dixfpgvnjpjaywwzqhfe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeGZwZ3ZuanBqYXl3d3pxaGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5ODk2MzUsImV4cCI6MjA4MDU2NTYzNX0.IXdSnFd_h6_SDCEkOZCn5qRJry1m7yZkpsPUji1uG5E";

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
    // Use implicit flow on mobile (PKCE requires WebCrypto API which isn't available on React Native)
    flowType: Platform.OS === 'web' ? 'pkce' : 'implicit',
  }
});