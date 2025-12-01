import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useChild } from '../contexts/ChildContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import FlashcardsScreen from './FlashcardsScreen';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { currentChild, loading: childLoading } = useChild();
  const { user } = useAuth();
  const [todaysWords, setTodaysWords] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [achievedMilestones, setAchievedMilestones] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);

  useEffect(() => {
    if (currentChild && user) {
      fetchDashboardData();
    } else if (!childLoading) {
      setLoading(false);
    }
  }, [currentChild, user, childLoading]);

  const fetchDashboardData = async () => {
    if (!currentChild || !user) return;

    try {
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];
      
      const [wordsResponse, todaysWordsResponse, milestonesResponse] = await Promise.all([
        supabase
          .from('words')
          .select('id')
          .eq('child_id', currentChild.id)
          .eq('user_id', user.id),

        supabase
          .from('words')
          .select('id')
          .eq('child_id', currentChild.id)
          .eq('user_id', user.id)
          .eq('date_learned', today),

        supabase
          .from('milestones')
          .select('id')
          .eq('child_id', currentChild.id)
          .eq('user_id', user.id)
          .eq('achieved', true),
      ]);

      setTotalWords(wordsResponse.data?.length || 0);
      setTodaysWords(todaysWordsResponse.data?.length || 0);
      setAchievedMilestones(milestonesResponse.data?.length || 0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthdate: string): string => {
    const months = Math.floor((Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''} old`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years} year${years !== 1 ? 's' : ''} old`;
      }
      return `${years}y ${remainingMonths}m old`;
    }
  };

  const handleAddWord = () => {
    navigation.navigate('Vocabulary' as never);
  };

  const openFlashcards = () => {
    setShowFlashcardsModal(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!currentChild) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noChildTitle}>Welcome to Little Linguist Studio! 👶</Text>
        <Text style={styles.noChildText}>Please add a child profile in Settings to get started tracking their language development.</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings' as never)}
        >
          <Text style={styles.settingsButtonText}>Go to Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Child Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentChild.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.childName}>{currentChild.name}</Text>
        <Text style={styles.childAge}>{calculateAge(currentChild.birthdate)}</Text>
      </View>

      {/* Dashboard Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalWords}</Text>
          <Text style={styles.statLabel}>Total Words</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todaysWords}</Text>
          <Text style={styles.statLabel}>Today's Words</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{achievedMilestones}</Text>
          <Text style={styles.statLabel}>Milestones</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionCard} onPress={handleAddWord}>
            <Text style={styles.quickActionIcon}>📝</Text>
            <Text style={styles.quickActionTitle}>Add Word</Text>
            <Text style={styles.quickActionSubtitle}>Track new vocabulary</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionCard} onPress={openFlashcards}>
            <Text style={styles.quickActionIcon}>🎴</Text>
            <Text style={styles.quickActionTitle}>Flashcards</Text>
            <Text style={styles.quickActionSubtitle}>Review words</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Statistics' as never)}
          >
            <Text style={styles.quickActionIcon}>📊</Text>
            <Text style={styles.quickActionTitle}>Statistics</Text>
            <Text style={styles.quickActionSubtitle}>View progress</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Flashcards Modal */}
      <Modal
        visible={showFlashcardsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setShowFlashcardsModal(false)}
            style={styles.modalCloseButton}
          >
            <Text style={styles.modalCloseText}>Done</Text>
          </TouchableOpacity>
        </View>
        <FlashcardsScreen />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noChildTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  noChildText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  settingsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: '#007AFF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  childName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  childAge: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  quickActionsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;