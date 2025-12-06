import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, BorderRadius, Typography, Spacing } from '../constants/Theme';

interface IOSInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const IOSInput: React.FC<IOSInputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={Colors.tertiaryLabel}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.footnote,
    color: Colors.secondaryLabel,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  input: {
    ...Typography.body,
    backgroundColor: Colors.tertiarySystemGroupedBackground,
    borderWidth: 1,
    borderColor: Colors.systemGray5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.label,
    minHeight: 50,
  },
  inputError: {
    borderColor: Colors.systemRed,
    borderWidth: 1,
  },
  errorText: {
    ...Typography.caption1,
    color: Colors.systemRed,
    marginTop: Spacing.xs,
  },
});
