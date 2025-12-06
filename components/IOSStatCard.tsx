import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/Theme';

interface IOSStatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color?: string;
  onPress?: () => void;
}

export const IOSStatCard: React.FC<IOSStatCardProps> = ({
  title,
  value,
  icon,
  color = Colors.systemBlue,
  onPress,
}) => {
  const content = (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.content}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <View style={styles.textContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.secondarySystemGroupedBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    ...Shadows.small,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  value: {
    ...Typography.title1,
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
  },
});
