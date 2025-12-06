import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { IOSButton } from '../components/IOSButton';
import { IOSInput } from '../components/IOSInput';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '../constants/Theme';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const AuthScreen = ({ onAuthSuccess }: AuthScreenProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      onAuthSuccess();
    }
  }, [user, loading]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = (): boolean => {
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password && !newErrors.confirmPassword;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email before signing in.';
        }
        Alert.alert('Sign In Failed', errorMessage);
      }
    } catch (error) {
      Alert.alert('Error', `Unexpected error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists.';
        }
        Alert.alert('Sign Up Failed', errorMessage);
      } else {
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        Alert.alert(
          'Success!',
          `Account created for ${data.user?.email}.\n\nPlease check your email to confirm your account.`,
          [{ text: 'OK', onPress: () => setIsSignUp(false) }]
        );
      }
    } catch (error) {
      Alert.alert('Error', `Unexpected error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(resetEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        resetEmail.toLowerCase().trim()
      );

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Password reset link sent to your email!');
        setShowResetForm(false);
        setResetEmail('');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>👶</Text>
          <Text style={styles.title}>Little Linguist</Text>
          <Text style={styles.subtitle}>Track your child's language journey</Text>
        </View>

        {!showResetForm ? (
          <View style={styles.formContainer}>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segment,
                  !isSignUp && styles.segmentActive,
                ]}
                onPress={() => {
                  setIsSignUp(false);
                  setErrors({ email: '', password: '', confirmPassword: '' });
                }}
              >
                <Text style={[
                  styles.segmentText,
                  !isSignUp && styles.segmentTextActive,
                ]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segment,
                  isSignUp && styles.segmentActive,
                ]}
                onPress={() => {
                  setIsSignUp(true);
                  setErrors({ email: '', password: '', confirmPassword: '' });
                }}
              >
                <Text style={[
                  styles.segmentText,
                  isSignUp && styles.segmentTextActive,
                ]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            <IOSInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({ ...errors, email: '' });
              }}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
            />

            <IOSInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: '' });
              }}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              error={errors.password}
            />

            {isSignUp && (
              <IOSInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors({ ...errors, confirmPassword: '' });
                }}
                placeholder="Confirm your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                error={errors.confirmPassword}
              />
            )}

            <IOSButton
              title={isSignUp ? 'Create Account' : 'Sign In'}
              onPress={isSignUp ? handleSignUp : handleSignIn}
              loading={isLoading}
              fullWidth
              style={styles.submitButton}
            />

            {!isSignUp && (
              <TouchableOpacity
                onPress={() => setShowResetForm(true)}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.resetTitle}>Reset Password</Text>
            <Text style={styles.resetDescription}>
              Enter your email and we'll send you a link to reset your password.
            </Text>

            <IOSInput
              label="Email"
              value={resetEmail}
              onChangeText={setResetEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <IOSButton
              title="Send Reset Link"
              onPress={handlePasswordReset}
              loading={isLoading}
              fullWidth
              style={styles.submitButton}
            />

            <TouchableOpacity
              onPress={() => setShowResetForm(false)}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.systemGroupedBackground,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Layout.screenPadding,
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: Colors.secondarySystemGroupedBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.tertiarySystemFill,
    borderRadius: BorderRadius.sm,
    padding: 2,
    marginBottom: Spacing.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm - 2,
  },
  segmentActive: {
    backgroundColor: Colors.systemBackground,
    shadowColor: Colors.label,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: Colors.label,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  linkText: {
    ...Typography.subheadline,
    color: Colors.systemBlue,
  },
  resetTitle: {
    ...Typography.title2,
    color: Colors.label,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  resetDescription: {
    ...Typography.subheadline,
    color: Colors.secondaryLabel,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});

export default AuthScreen;
