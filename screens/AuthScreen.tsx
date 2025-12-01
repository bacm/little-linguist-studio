import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { testDatabaseSetup, setupDefaultCategories } from '../lib/database-setup';

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

  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      onAuthSuccess();
    }
  }, [user, loading]);

  const testConnection = async () => {
    try {
      console.log('🔍 Running comprehensive database test...');
      
      const results = await testDatabaseSetup();
      console.log('Database test results:', results);
      
      let message = 'Database Test Results:\n\n';
      message += `${results.authWorking ? '✅' : '❌'} Authentication: ${results.authWorking ? 'Working' : 'Failed'}\n`;
      message += `${results.tablesExist ? '✅' : '❌'} Tables: ${results.tablesExist ? 'Accessible' : 'Missing'}\n`;
      message += `${results.hasCategories ? '✅' : '❌'} Categories: ${results.hasCategories ? 'Data exists' : 'Empty'}\n`;
      
      if (results.errors.length > 0) {
        message += '\nErrors:\n' + results.errors.map(e => `• ${e}`).join('\n');
      }
      
      // If tables exist but no categories, offer to set them up
      if (results.tablesExist && !results.hasCategories) {
        Alert.alert(
          'Setup Required',
          message + '\n\nWould you like to setup default word categories?',
          [
            { text: 'No', style: 'cancel' },
            { 
              text: 'Yes, Setup Categories', 
              onPress: async () => {
                const setupResult = await setupDefaultCategories();
                Alert.alert(
                  'Setup Result',
                  setupResult.success 
                    ? 'Default categories created successfully!' 
                    : `Setup failed: ${setupResult.error}`
                );
              }
            },
          ]
        );
      } else {
        Alert.alert('Database Test', message);
      }
      
    } catch (error) {
      console.error('❌ Connection test error:', error);
      Alert.alert('Database Test', `Test failed: ${error}`);
    }
  };

  const createTestAccount = async () => {
    const testEmail = `test-${Date.now()}@gmail.com`;
    const testPassword = 'test123456';
    
    Alert.alert(
      'Create Test Account',
      `This will create a test account with:\nEmail: ${testEmail}\nPassword: ${testPassword}\n\nProceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            setIsLoading(true);
            try {
              const { data, error } = await supabase.auth.signUp({
                email: testEmail,
                password: testPassword,
                options: {
                  emailRedirectTo: 'https://soqqamkrbcwzimwrkclb.supabase.co/auth/v1/verify'
                }
              });
              
              if (error) {
                Alert.alert('Test Account Failed', error.message);
              } else {
                Alert.alert(
                  'Test Account Created',
                  `Account created successfully!\nEmail: ${testEmail}\nPassword: ${testPassword}\n\n${data.user?.email_confirmed_at ? 'Email is confirmed' : 'Check email for confirmation link'}`
                );
                setEmail(testEmail);
                setPassword(testPassword);
              }
            } catch (error) {
              Alert.alert('Error', `Failed to create test account: ${error}`);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const testAuth = async () => {
    try {
      console.log('🔐 Testing auth functionality...');
      
      // Test 1: Check current session
      const { data: currentSession, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', currentSession, sessionError);
      
      // Test 2: Check auth state listener setup
      console.log('Auth context state:', { user: user?.email || 'none', loading });
      
      // Test 3: Try a simple auth operation
      const testEmail = `test-${Date.now()}@gmail.com`;
      const testPassword = 'test123456';
      
      console.log('🧪 Testing sign up with:', testEmail);
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      
      console.log('Test sign up result:', {
        success: !signUpError,
        user_created: !!signUpData.user,
        session_created: !!signUpData.session,
        error: signUpError?.message
      });
      
      Alert.alert(
        'Auth Test Results',
        `Current Session: ${currentSession?.user ? 'Active' : 'None'}\n` +
        `Auth Context: ${user ? 'Connected' : 'Disconnected'}\n` +
        `Test Sign Up: ${signUpError ? 'Failed' : 'Success'}\n` +
        `${signUpError ? `Error: ${signUpError.message}` : ''}`
      );
      
    } catch (error) {
      console.error('❌ Auth test error:', error);
      Alert.alert('Auth Test Failed', `Error: ${error}`);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.toLowerCase().trim(),
      });

      if (error) {
        Alert.alert('Resend Failed', error.message);
      } else {
        Alert.alert('Email Sent!', 'We\'ve sent another confirmation email. Please check your inbox and spam folder.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend confirmation email.');
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    console.log('🔐 Starting sign in process...');
    console.log('Email:', email);
    console.log('Password length:', password.length);

    try {
      console.log('📡 Calling supabase.auth.signInWithPassword...');
      console.log('🔍 Request details:', {
        email: email.toLowerCase().trim(),
        passwordLength: password.length,
        timestamp: new Date().toISOString()
      });

      const response = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      console.log('🔍 Raw response type:', typeof response);
      console.log('🔍 Raw response keys:', Object.keys(response || {}));
      console.log('🔍 Raw response:', response);

      const { data, error } = response;

      console.log('📥 Parsed response parts:');
      console.log('  - Data exists:', !!data);
      console.log('  - Data type:', typeof data);
      console.log('  - Data keys:', data ? Object.keys(data) : 'none');
      console.log('  - Error exists:', !!error);
      console.log('  - Error type:', typeof error);

      if (data) {
        console.log('📊 Data details:', {
          user: data.user ? {
            id: data.user.id,
            email: data.user.email,
            email_confirmed_at: data.user.email_confirmed_at,
            created_at: data.user.created_at
          } : 'NO USER',
          session: data.session ? {
            access_token: data.session.access_token ? 'present' : 'missing',
            refresh_token: data.session.refresh_token ? 'present' : 'missing',
            expires_at: data.session.expires_at
          } : 'NO SESSION'
        });
      }

      if (error) {
        console.log('❌ Error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          cause: error.cause
        });
      }

      if (error) {
        console.error('❌ Sign in failed:', error.message);
        
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. If you just signed up, you may need to confirm your email first. Check your inbox (and spam folder) for a confirmation email.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many sign-in attempts. Please wait a moment and try again.';
        }
        
        if (error.message.includes('Invalid login credentials')) {
          Alert.alert(
            'Sign In Failed', 
            errorMessage,
            [
              { text: 'OK', style: 'cancel' },
              { 
                text: 'Resend Confirmation', 
                onPress: () => {
                  if (email) {
                    resendConfirmation(email);
                  } else {
                    Alert.alert('Error', 'Please enter your email address first');
                  }
                }
              }
            ]
          );
        } else {
          Alert.alert('Sign In Failed', errorMessage);
        }
      } else {
        console.log('✅ Sign in successful for user:', data.user?.email);
        console.log('Session created:', data.session ? 'Yes' : 'No');
        
        // Show immediate success feedback
        Alert.alert(
          '🎉 Welcome Back!',
          `Successfully signed in as ${data.user?.email}`,
          [{ text: 'Continue', onPress: () => {} }]
        );
        
        // Check if this triggers auth state change
        setTimeout(() => {
          if (!user) {
            console.log('⚠️ Warning: Sign in successful but user state not updated');
            Alert.alert('Session Issue', 'Sign in was successful but there may be a session sync issue. You should still be able to use the app.');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Unexpected sign in error:', error);
      Alert.alert('Error', `Unexpected error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    console.log('📝 Starting sign up process...');
    console.log('Email:', email);
    console.log('Password length:', password.length);

    try {
      console.log('📡 Calling supabase.auth.signUp...');
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: 'https://soqqamkrbcwzimwrkclb.supabase.co/auth/v1/verify'
        }
      });

      console.log('📥 Sign up complete - Full response:', {
        data: {
          user: data?.user ? {
            id: data.user.id,
            email: data.user.email,
            email_confirmed_at: data.user.email_confirmed_at,
            confirmation_sent_at: data.user.confirmation_sent_at
          } : null,
          session: data?.session ? {
            access_token: data.session.access_token ? 'present' : 'missing'
          } : null
        },
        error: error ? {
          message: error.message,
          status: error.status
        } : null
      });

      if (error) {
        console.error('❌ Sign up failed:', error.message);
        
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Try signing in instead.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address. Avoid using fake domains like @example.com';
        } else if (error.message.includes('invalid')) {
          errorMessage = 'Please use a valid email address (like @gmail.com, @yahoo.com, etc.)';
        }
        
        Alert.alert('Account Creation Failed', errorMessage);
      } else {
        console.log('✅ Sign up successful for user:', data.user?.email);
        console.log('Email confirmation required:', !data.user?.email_confirmed_at);
        console.log('Session created immediately:', data.session ? 'Yes' : 'No');
        
        // Clear form on success
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        if (data.user?.email_confirmed_at) {
          Alert.alert(
            '🎉 Account Created!', 
            'Your account has been created and verified! You can now sign in.',
            [{ text: 'OK', onPress: () => setIsSignUp(false) }]
          );
        } else {
          Alert.alert(
            '✅ Account Created!',
            `Great! We've created your account for ${data.user?.email}.\n\nPlease check your email and click the confirmation link to complete your registration.\n\n📧 Don't forget to check your spam folder!`,
            [
              { text: 'OK', onPress: () => setIsSignUp(false) },
              { text: 'Resend Email', onPress: () => resendConfirmation(data.user?.email || email) }
            ]
          );
        }
      }
    } catch (error) {
      console.error('❌ Unexpected sign up error:', error);
      Alert.alert('Error', `Unexpected error during sign up: ${error}`);
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
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.toLowerCase().trim());

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Password reset link sent to your email!');
        setShowResetForm(false);
        setResetEmail('');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Little Linguist Studio</Text>
          <Text style={styles.subtitle}>Track your child's language development</Text>
        </View>

        {!showResetForm ? (
          <View style={styles.formContainer}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, !isSignUp && styles.activeTab]}
                onPress={() => setIsSignUp(false)}
              >
                <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, isSignUp && styles.activeTab]}
                onPress={() => setIsSignUp(true)}
              >
                <Text style={[styles.tabText, isSignUp && styles.activeTabText]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry={true}
                  autoCapitalize="none"
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={isSignUp ? handleSignUp : handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            {!isSignUp && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => setShowResetForm(true)}
              >
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.testButton}
              onPress={testConnection}
            >
              <Text style={styles.testButtonText}>Test Connection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.authTestButton}
              onPress={testAuth}
            >
              <Text style={styles.authTestButtonText}>Test Auth Flow</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createTestAccountButton}
              onPress={createTestAccount}
            >
              <Text style={styles.createTestAccountText}>Create Test Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.resetTitle}>Reset Password</Text>
            <Text style={styles.resetDescription}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={resetEmail}
                onChangeText={setResetEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handlePasswordReset}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => setShowResetForm(false)}
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
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 16,
  },
  eyeText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
  testButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  authTestButton: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  authTestButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  resetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  resetDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
});

export default AuthScreen;