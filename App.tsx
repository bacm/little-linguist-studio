import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChildProvider } from './contexts/ChildContext';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import MilestonesScreen from './screens/MilestonesScreen';
import VocabularyScreen from './screens/VocabularyScreen';
import SettingsScreen from './screens/SettingsScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import { ActivityIndicator, View } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={() => setShowAuth(false)} />;
  }

  return (
    <ChildProvider>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            title: 'Home',
            headerTitle: 'Little Linguist Studio',
            tabBarIcon: ({ color }) => (
              <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 12 }} />
            ),
          }} 
        />
        <Tab.Screen 
          name="Vocabulary" 
          component={VocabularyScreen} 
          options={{ 
            title: 'Words',
            headerTitle: 'Vocabulary Tracker',
            tabBarIcon: ({ color }) => (
              <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 4 }} />
            ),
          }} 
        />
        <Tab.Screen 
          name="Statistics" 
          component={StatisticsScreen} 
          options={{ 
            title: 'Stats',
            headerTitle: 'Statistics',
            tabBarIcon: ({ color }) => (
              <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 6 }} />
            ),
          }} 
        />
        <Tab.Screen 
          name="Milestones" 
          component={MilestonesScreen} 
          options={{ 
            title: 'Milestones',
            headerTitle: 'Speech Milestones',
            tabBarIcon: ({ color }) => (
              <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 8 }} />
            ),
          }} 
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ 
            title: 'Settings',
            headerTitle: 'Settings',
            tabBarIcon: ({ color }) => (
              <View style={{ width: 24, height: 24, backgroundColor: color, borderRadius: 4 }} />
            ),
          }} 
        />
      </Tab.Navigator>
    </ChildProvider>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}