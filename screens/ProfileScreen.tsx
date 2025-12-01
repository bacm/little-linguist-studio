import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const ProfileScreen = () => {
  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing will be implemented with full functionality');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings page will be implemented with full functionality');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>E</Text>
        </View>
        <Text style={styles.name}>Emma</Text>
        <Text style={styles.age}>8 months old</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <Text style={styles.menuText}>✏️ Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
          <Text style={styles.menuText}>⚙️ Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>📊 Progress Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>🔔 Notifications</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    backgroundColor: '#4A90E2',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  age: {
    fontSize: 16,
    color: '#6B7280',
  },
  menuSection: {
    paddingHorizontal: 16,
  },
  menuItem: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
});

export default ProfileScreen;