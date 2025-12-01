import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface Milestone {
  id: string;
  title: string;
  description: string;
  ageRange: string;
  completed: boolean;
}

const milestones: Milestone[] = [
  {
    id: '1',
    title: 'First Words',
    description: 'Says first meaningful words like "mama" or "dada"',
    ageRange: '6-12 months',
    completed: true,
  },
  {
    id: '2',
    title: 'Following Simple Commands',
    description: 'Responds to simple requests like "come here" or "give me"',
    ageRange: '8-12 months',
    completed: true,
  },
  {
    id: '3',
    title: 'Two-Word Phrases',
    description: 'Combines two words like "more milk" or "go bye-bye"',
    ageRange: '12-18 months',
    completed: false,
  },
  {
    id: '4',
    title: 'Vocabulary of 50+ Words',
    description: 'Uses at least 50 different words regularly',
    ageRange: '18-24 months',
    completed: false,
  },
  {
    id: '5',
    title: 'Simple Sentences',
    description: 'Forms 3-4 word sentences',
    ageRange: '2-3 years',
    completed: false,
  },
];

const MilestonesScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Speech Milestones</Text>
        <Text style={styles.subtitle}>Track your child's language development</Text>
      </View>

      <View style={styles.milestonesList}>
        {milestones.map((milestone) => (
          <TouchableOpacity key={milestone.id} style={styles.milestoneCard}>
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneTitle}>{milestone.title}</Text>
              <View style={[styles.statusBadge, milestone.completed ? styles.completedBadge : styles.pendingBadge]}>
                <Text style={[styles.statusText, milestone.completed ? styles.completedText : styles.pendingText]}>
                  {milestone.completed ? '✓' : '○'}
                </Text>
              </View>
            </View>
            <Text style={styles.ageRange}>{milestone.ageRange}</Text>
            <Text style={styles.description}>{milestone.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  milestonesList: {
    paddingHorizontal: 16,
  },
  milestoneCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: {
    backgroundColor: '#10B981',
  },
  pendingBadge: {
    backgroundColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedText: {
    color: 'white',
  },
  pendingText: {
    color: '#9CA3AF',
  },
  ageRange: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default MilestonesScreen;