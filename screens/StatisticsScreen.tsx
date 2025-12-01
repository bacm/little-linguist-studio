import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useChild } from '../contexts/ChildContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

const { width } = Dimensions.get('window');

interface WordStats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  byCategory: { [key: string]: { count: number; color: string; name: string } };
  recentWords: Array<{ word: string; date: string; category: string }>;
}

interface MilestoneStats {
  total: number;
  achieved: number;
  percentage: number;
  recentAchievements: Array<{ title: string; achievedDate: string }>;
}

const StatisticsScreen = () => {
  const { currentChild } = useChild();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wordStats, setWordStats] = useState<WordStats>({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    byCategory: {},
    recentWords: [],
  });
  const [milestoneStats, setMilestoneStats] = useState<MilestoneStats>({
    total: 0,
    achieved: 0,
    percentage: 0,
    recentAchievements: [],
  });

  useEffect(() => {
    if (currentChild && user) {
      fetchStatistics();
    }
  }, [currentChild, user]);

  const fetchStatistics = async () => {
    if (!currentChild || !user) return;

    try {
      setLoading(true);

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [wordsResponse, categoriesResponse, milestonesResponse] = await Promise.all([
        supabase
          .from('words')
          .select('word, date_learned, category_id')
          .eq('child_id', currentChild.id)
          .eq('user_id', user.id),

        supabase
          .from('word_categories')
          .select('id, name, color'),

        supabase
          .from('milestones')
          .select('title, achieved, achieved_date')
          .eq('child_id', currentChild.id)
          .eq('user_id', user.id),
      ]);

      if (wordsResponse.data && categoriesResponse.data) {
        const words = wordsResponse.data;
        const categories = categoriesResponse.data;
        
        const categoryMap = categories.reduce((acc, cat) => {
          acc[cat.id] = { name: cat.name, color: cat.color };
          return acc;
        }, {} as any);

        const thisWeekWords = words.filter(w => new Date(w.date_learned) >= oneWeekAgo);
        const thisMonthWords = words.filter(w => new Date(w.date_learned) >= oneMonthAgo);

        const byCategory = words.reduce((acc, word) => {
          const categoryId = word.category_id || 'unknown';
          const categoryInfo = categoryMap[categoryId] || { name: 'Unknown', color: '#gray' };
          
          if (!acc[categoryId]) {
            acc[categoryId] = {
              count: 0,
              name: categoryInfo.name,
              color: categoryInfo.color,
            };
          }
          acc[categoryId].count++;
          return acc;
        }, {} as any);

        const recentWords = words
          .sort((a, b) => new Date(b.date_learned).getTime() - new Date(a.date_learned).getTime())
          .slice(0, 5)
          .map(w => ({
            word: w.word,
            date: w.date_learned,
            category: categoryMap[w.category_id || '']?.name || 'Unknown',
          }));

        setWordStats({
          total: words.length,
          thisWeek: thisWeekWords.length,
          thisMonth: thisMonthWords.length,
          byCategory,
          recentWords,
        });
      }

      if (milestonesResponse.data) {
        const milestones = milestonesResponse.data;
        const achievedMilestones = milestones.filter(m => m.achieved);
        const percentage = milestones.length > 0 ? Math.round((achievedMilestones.length / milestones.length) * 100) : 0;

        const recentAchievements = achievedMilestones
          .filter(m => m.achieved_date)
          .sort((a, b) => new Date(b.achieved_date!).getTime() - new Date(a.achieved_date!).getTime())
          .slice(0, 3)
          .map(m => ({
            title: m.title,
            achievedDate: m.achieved_date!,
          }));

        setMilestoneStats({
          total: milestones.length,
          achieved: achievedMilestones.length,
          percentage,
          recentAchievements,
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  if (!currentChild) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noChildText}>Please add a child profile first</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Progress Overview</Text>
        <Text style={styles.subtitle}>Track {currentChild.name}'s language development</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.primaryCard]}>
          <Text style={styles.statNumber}>{wordStats.total}</Text>
          <Text style={styles.statLabel}>Total Words</Text>
        </View>

        <View style={[styles.statCard, styles.secondaryCard]}>
          <Text style={styles.statNumber}>{wordStats.thisWeek}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>

        <View style={[styles.statCard, styles.secondaryCard]}>
          <Text style={styles.statNumber}>{wordStats.thisMonth}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>

        <View style={[styles.statCard, styles.secondaryCard]}>
          <Text style={styles.statNumber}>{milestoneStats.percentage}%</Text>
          <Text style={styles.statLabel}>Milestones</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📝 Words by Category</Text>
        <View style={styles.categoryContainer}>
          {Object.entries(wordStats.byCategory).map(([categoryId, data]) => (
            <View key={categoryId} style={styles.categoryCard}>
              <View style={[styles.categoryColor, { backgroundColor: data.color }]} />
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{data.name}</Text>
                <Text style={styles.categoryCount}>{data.count} words</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Milestone Progress</Text>
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneHeader}>
            <Text style={styles.milestoneNumber}>{milestoneStats.achieved}/{milestoneStats.total}</Text>
            <Text style={styles.milestoneLabel}>Achieved</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${milestoneStats.percentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{milestoneStats.percentage}% Complete</Text>
          </View>

          {milestoneStats.recentAchievements.length > 0 && (
            <View style={styles.recentAchievements}>
              <Text style={styles.recentTitle}>Recent Achievements:</Text>
              {milestoneStats.recentAchievements.map((achievement, index) => (
                <View key={index} style={styles.achievementItem}>
                  <Text style={styles.achievementText}>🏆 {achievement.title}</Text>
                  <Text style={styles.achievementDate}>
                    {new Date(achievement.achievedDate).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🆕 Recent Words</Text>
        <View style={styles.recentWordsContainer}>
          {wordStats.recentWords.length > 0 ? (
            wordStats.recentWords.map((word, index) => (
              <View key={index} style={styles.recentWordCard}>
                <View style={styles.recentWordHeader}>
                  <Text style={styles.recentWord}>{word.word}</Text>
                  <Text style={styles.recentWordCategory}>{word.category}</Text>
                </View>
                <Text style={styles.recentWordDate}>
                  {new Date(word.date).toLocaleDateString()}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No words added yet</Text>
            </View>
          )}
        </View>
      </View>
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noChildText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryCard: {
    backgroundColor: '#007AFF',
  },
  secondaryCard: {
    backgroundColor: 'white',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  categoryContainer: {
    gap: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  milestoneCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  milestoneHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  milestoneNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  milestoneLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  recentAchievements: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  achievementText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  achievementDate: {
    fontSize: 12,
    color: '#666',
  },
  recentWordsContainer: {
    gap: 8,
  },
  recentWordCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recentWordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentWord: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  recentWordCategory: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recentWordDate: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default StatisticsScreen;