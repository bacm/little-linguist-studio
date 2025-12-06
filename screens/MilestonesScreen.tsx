import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useChild } from '../contexts/ChildContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Colors, Typography, Spacing, BorderRadius, Layout, Shadows } from '../constants/Theme';
import { IOSButton } from '../components/IOSButton';
import { updateVocabularyMilestones } from '../lib/milestone-helpers';

interface Milestone {
  id: string;
  child_id: string;
  user_id: string;
  title: string;
  description: string | null;
  milestone_type: string;
  target_value: number;
  current_value: number;
  achieved: boolean;
  achieved_date: string | null;
  icon: string;
  created_at: string;
  updated_at: string;
}

const MilestonesScreen = () => {
  const { currentChild } = useChild();
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (currentChild && user) {
      fetchMilestones();
    } else {
      setLoading(false);
    }
  }, [currentChild, user]);

  const fetchMilestones = async (isRefreshing = false) => {
    if (!currentChild || !user) return;

    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('child_id', currentChild.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMilestones(data || []);

      // If no milestones exist, create default ones
      if (!data || data.length === 0) {
        await createDefaultMilestones();
      } else {
        // Update vocabulary milestones based on current word count
        await updateVocabularyMilestones(currentChild.id, user.id);

        // Refetch to get updated values
        const { data: updatedData } = await supabase
          .from('milestones')
          .select('*')
          .eq('child_id', currentChild.id)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (updatedData) {
          setMilestones(updatedData);
        }
      }
    } catch (error) {
      console.error('Error fetching milestones:', error);
      Alert.alert('Error', 'Failed to load milestones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const createDefaultMilestones = async () => {
    if (!currentChild || !user) return;

    try {
      const defaultMilestones = [
        {
          child_id: currentChild.id,
          user_id: user.id,
          title: 'First Word',
          description: 'Baby says their first recognizable word',
          milestone_type: 'vocabulary',
          target_value: 1,
          current_value: 0,
          icon: '🗣️',
        },
        {
          child_id: currentChild.id,
          user_id: user.id,
          title: '10 Words',
          description: 'Vocabulary reaches 10 words',
          milestone_type: 'vocabulary',
          target_value: 10,
          current_value: 0,
          icon: '🏆',
        },
        {
          child_id: currentChild.id,
          user_id: user.id,
          title: '50 Words',
          description: 'Vocabulary reaches 50 words',
          milestone_type: 'vocabulary',
          target_value: 50,
          current_value: 0,
          icon: '🏆',
        },
        {
          child_id: currentChild.id,
          user_id: user.id,
          title: '100 Words',
          description: 'Vocabulary reaches 100 words',
          milestone_type: 'vocabulary',
          target_value: 100,
          current_value: 0,
          icon: '🏆',
        },
        {
          child_id: currentChild.id,
          user_id: user.id,
          title: 'First Phrase',
          description: 'Baby combines two words into a phrase',
          milestone_type: 'speech',
          target_value: 1,
          current_value: 0,
          icon: '💬',
        },
        {
          child_id: currentChild.id,
          user_id: user.id,
          title: 'First Sentence',
          description: 'Baby speaks their first complete sentence',
          milestone_type: 'speech',
          target_value: 1,
          current_value: 0,
          icon: '📝',
        },
      ];

      const { error } = await supabase
        .from('milestones')
        .insert(defaultMilestones);

      if (error) throw error;

      // Refresh milestones
      await fetchMilestones();
    } catch (error) {
      console.error('Error creating default milestones:', error);
    }
  };

  const toggleMilestone = async (milestone: Milestone) => {
    if (!currentChild || !user) return;

    try {
      const newAchievedState = !milestone.achieved;

      const { error } = await supabase
        .from('milestones')
        .update({
          achieved: newAchievedState,
          achieved_date: newAchievedState ? new Date().toISOString() : null,
        })
        .eq('id', milestone.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setMilestones(prev =>
        prev.map(m =>
          m.id === milestone.id
            ? { ...m, achieved: newAchievedState, achieved_date: newAchievedState ? new Date().toISOString() : null }
            : m
        )
      );
    } catch (error) {
      console.error('Error updating milestone:', error);
      Alert.alert('Error', 'Failed to update milestone');
    }
  };

  const onRefresh = () => {
    fetchMilestones(true);
  };

  const getProgressPercentage = (milestone: Milestone): number => {
    if (milestone.achieved) return 100;
    return Math.min(100, Math.round((milestone.current_value / milestone.target_value) * 100));
  };

  const getMilestoneTypeColor = (type: string): string => {
    switch (type) {
      case 'vocabulary':
        return Colors.systemBlue;
      case 'speech':
        return Colors.systemPurple;
      case 'communication':
        return Colors.systemGreen;
      default:
        return Colors.systemGray;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.systemBlue} />
        <Text style={styles.loadingText}>Loading milestones...</Text>
      </View>
    );
  }

  if (!currentChild) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎯</Text>
        <Text style={styles.emptyTitle}>No Child Profile</Text>
        <Text style={styles.emptyText}>
          Please select or add a child profile in Settings to track milestones.
        </Text>
      </View>
    );
  }

  return (
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Track Progress</Text>
        <Text style={styles.headerSubtitle}>
          {milestones.filter(m => m.achieved).length} of {milestones.length} milestones achieved
        </Text>
      </View>

      {/* Milestones List */}
      <View style={styles.section}>
        {milestones.length === 0 ? (
          <View style={styles.noMilestones}>
            <Text style={styles.noMilestonesText}>No milestones yet</Text>
            <IOSButton
              title="Create Default Milestones"
              onPress={createDefaultMilestones}
              style={styles.createButton}
            />
          </View>
        ) : (
          milestones.map((milestone) => {
            const progress = getProgressPercentage(milestone);
            const typeColor = getMilestoneTypeColor(milestone.milestone_type);

            return (
              <TouchableOpacity
                key={milestone.id}
                style={[
                  styles.milestoneCard,
                  milestone.achieved && styles.milestoneCardAchieved,
                ]}
                onPress={() => toggleMilestone(milestone)}
                activeOpacity={0.7}
              >
                <View style={styles.milestoneHeader}>
                  <View style={styles.milestoneInfo}>
                    <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
                    <View style={styles.milestoneText}>
                      <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                      {milestone.description && (
                        <Text style={styles.milestoneDescription}>
                          {milestone.description}
                        </Text>
                      )}
                      <View style={styles.milestoneMeta}>
                        <View
                          style={[
                            styles.typeTag,
                            { backgroundColor: typeColor + '15' },
                          ]}
                        >
                          <Text style={[styles.typeText, { color: typeColor }]}>
                            {milestone.milestone_type}
                          </Text>
                        </View>
                        {milestone.milestone_type === 'vocabulary' && (
                          <Text style={styles.progressText}>
                            {milestone.current_value} / {milestone.target_value} words
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusIndicator,
                      milestone.achieved
                        ? styles.statusAchieved
                        : styles.statusPending,
                    ]}
                  >
                    <Text style={styles.statusIcon}>
                      {milestone.achieved ? '✓' : '○'}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar for vocabulary milestones */}
                {milestone.milestone_type === 'vocabulary' && !milestone.achieved && (
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${progress}%`, backgroundColor: typeColor },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressPercentage}>{progress}%</Text>
                  </View>
                )}

                {milestone.achieved && milestone.achieved_date && (
                  <Text style={styles.achievedDate}>
                    Achieved on {new Date(milestone.achieved_date).toLocaleDateString()}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
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
    maxWidth: 300,
  },
  header: {
    backgroundColor: Colors.secondarySystemGroupedBackground,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    ...Typography.title2,
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
  },
  section: {
    paddingHorizontal: Layout.screenPadding,
  },
  noMilestones: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  noMilestonesText: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    marginBottom: Spacing.lg,
  },
  createButton: {
    minWidth: 200,
  },
  milestoneCard: {
    backgroundColor: Colors.secondarySystemGroupedBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.systemGray4,
    ...Shadows.small,
  },
  milestoneCardAchieved: {
    borderLeftColor: Colors.systemGreen,
    opacity: 0.8,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  milestoneInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  milestoneIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  milestoneText: {
    flex: 1,
  },
  milestoneTitle: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  milestoneDescription: {
    ...Typography.footnote,
    color: Colors.secondaryLabel,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  milestoneMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  typeTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    ...Typography.caption2,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  progressText: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  statusAchieved: {
    backgroundColor: Colors.systemGreen,
  },
  statusPending: {
    backgroundColor: Colors.systemGray5,
  },
  statusIcon: {
    fontSize: 16,
    color: Colors.systemBackground,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.systemGray5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercentage: {
    ...Typography.caption2,
    color: Colors.secondaryLabel,
    fontWeight: '600',
    minWidth: 32,
  },
  achievedDate: {
    ...Typography.caption1,
    color: Colors.systemGreen,
    marginTop: Spacing.sm,
    fontWeight: '500',
  },
});

export default MilestonesScreen;
