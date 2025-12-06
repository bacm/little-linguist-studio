import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useChild } from '../contexts/ChildContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import FlashcardsScreen from './FlashcardsScreen';
import { IOSButton } from '../components/IOSButton';
import { IOSStatCard } from '../components/IOSStatCard';
import { Colors, Typography, Spacing, BorderRadius, Layout, Shadows } from '../constants/Theme';
import { updateVocabularyMilestones } from '../lib/milestone-helpers';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { currentChild, loading: childLoading } = useChild();
  const { user } = useAuth();
  const [todaysWords, setTodaysWords] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [achievedMilestones, setAchievedMilestones] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);

  useEffect(() => {
    if (currentChild && user) {
      fetchDashboardData();
    } else if (!childLoading) {
      setLoading(false);
    }
  }, [currentChild, user, childLoading]);

  const fetchDashboardData = async (isRefreshing = false) => {
    if (!currentChild || !user) return;

    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
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

      // Update vocabulary milestones in background
      updateVocabularyMilestones(currentChild.id, user.id).catch(err =>
        console.error('Error updating milestones in background:', err)
      );
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchDashboardData(true);
  };

  const calculateAge = (birthdate: string): string => {
    const months = Math.floor(
      (Date.now() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.systemBlue} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!currentChild) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👶</Text>
        <Text style={styles.emptyTitle}>Welcome to Little Linguist!</Text>
        <Text style={styles.emptyText}>
          Add your child's profile in Settings to start tracking their language journey.
        </Text>
        <IOSButton
          title="Go to Settings"
          onPress={() => navigation.navigate('Settings' as never)}
          style={styles.emptyButton}
        />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.systemBlue}
          />
        }
      >
        {/* Compact Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{currentChild.avatar || '👶'}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.childName}>{currentChild.name}</Text>
            <Text style={styles.childAge}>{calculateAge(currentChild.birthdate)}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <IOSStatCard
              title="Total Words"
              value={totalWords}
              icon="📚"
              color={Colors.systemBlue}
            />
            <IOSStatCard
              title="Today"
              value={todaysWords}
              icon="✨"
              color={Colors.systemGreen}
            />
            <IOSStatCard
              title="Milestones"
              value={achievedMilestones}
              icon="🏆"
              color={Colors.systemOrange}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <View style={styles.actionsRow}>
              <View style={styles.actionWrapper}>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('Vocabulary' as never)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconContainer, { backgroundColor: Colors.systemBlue + '15' }]}>
                    <Text style={styles.actionIcon}>📝</Text>
                  </View>
                  <Text style={styles.actionTitle}>Add Word</Text>
                  <Text style={styles.actionSubtitle}>Track vocabulary</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actionWrapper}>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => setShowFlashcardsModal(true)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconContainer, { backgroundColor: Colors.systemPurple + '15' }]}>
                    <Text style={styles.actionIcon}>🎴</Text>
                  </View>
                  <Text style={styles.actionTitle}>Flashcards</Text>
                  <Text style={styles.actionSubtitle}>Review words</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <View style={styles.actionWrapper}>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('Milestones' as never)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconContainer, { backgroundColor: Colors.systemOrange + '15' }]}>
                    <Text style={styles.actionIcon}>🎯</Text>
                  </View>
                  <Text style={styles.actionTitle}>Milestones</Text>
                  <Text style={styles.actionSubtitle}>Track progress</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actionWrapper}>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => navigation.navigate('Statistics' as never)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconContainer, { backgroundColor: Colors.systemGreen + '15' }]}>
                    <Text style={styles.actionIcon}>📊</Text>
                  </View>
                  <Text style={styles.actionTitle}>Statistics</Text>
                  <Text style={styles.actionSubtitle}>View insights</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Flashcards Modal */}
      <Modal
        visible={showFlashcardsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowFlashcardsModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlashcardsScreen />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.systemGroupedBackground,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.systemGroupedBackground,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.systemGroupedBackground,
    padding: Layout.screenPadding,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.title1,
    color: Colors.label,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    maxWidth: 300,
  },
  emptyButton: {
    minWidth: 200,
  },
  // Compact horizontal header
  header: {
    backgroundColor: Colors.secondarySystemGroupedBackground,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.systemBlue + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatar: {
    fontSize: 28,
  },
  headerText: {
    flex: 1,
  },
  childName: {
    ...Typography.title3,
    color: Colors.label,
    marginBottom: 2,
  },
  childAge: {
    ...Typography.footnote,
    color: Colors.secondaryLabel,
  },
  section: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.title3,
    color: Colors.label,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    gap: Spacing.md,
  },
  // Fixed grid layout for actions
  actionsContainer: {
    gap: Spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionWrapper: {
    flex: 1,
  },
  actionCard: {
    backgroundColor: Colors.secondarySystemGroupedBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.small,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionIcon: {
    fontSize: 26,
  },
  actionTitle: {
    ...Typography.subheadline,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: 2,
  },
  actionSubtitle: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.systemGroupedBackground,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.secondarySystemGroupedBackground,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
  },
  modalCloseButton: {
    padding: Spacing.sm,
  },
  modalCloseText: {
    ...Typography.body,
    color: Colors.systemBlue,
    fontWeight: '600',
  },
});

export default HomeScreen;
