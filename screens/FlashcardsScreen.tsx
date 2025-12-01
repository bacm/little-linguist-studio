import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { PanGestureHandler, State, PanGestureHandlerGestureEvent, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { useChild } from '../contexts/ChildContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Tables } from '../integrations/supabase/types';

const { width } = Dimensions.get('window');

interface Word extends Tables<'words'> {
  word_categories?: Tables<'word_categories'>;
}

const FlashcardsScreen = () => {
  const { currentChild } = useChild();
  const { user } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [reviewedWords, setReviewedWords] = useState<string[]>([]);
  const [correctWords, setCorrectWords] = useState<string[]>([]);

  const translateX = new Animated.Value(0);
  const cardRotation = new Animated.Value(0);

  useEffect(() => {
    if (currentChild && user) {
      fetchWords();
    }
  }, [currentChild, user]);

  const fetchWords = async () => {
    if (!currentChild || !user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('words')
        .select(`
          *,
          word_categories (*)
        `)
        .eq('child_id', currentChild.id)
        .eq('user_id', user.id)
        .limit(20);

      if (error) {
        console.error('Error fetching words:', error);
        Alert.alert('Error', 'Failed to load words');
      } else {
        setWords(data || []);
        if (data && data.length > 0) {
          setSessionStarted(true);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 180;
    Animated.timing(cardRotation, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      cardRotation.setValue(0);
      translateX.setValue(0);
    } else {
      endSession();
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      cardRotation.setValue(0);
      translateX.setValue(0);
    }
  };

  const markAsCorrect = () => {
    const currentWord = words[currentIndex];
    if (currentWord && !correctWords.includes(currentWord.id)) {
      setCorrectWords([...correctWords, currentWord.id]);
    }
    if (!reviewedWords.includes(currentWord.id)) {
      setReviewedWords([...reviewedWords, currentWord.id]);
    }
    nextCard();
  };

  const markAsIncorrect = () => {
    const currentWord = words[currentIndex];
    if (currentWord && !reviewedWords.includes(currentWord.id)) {
      setReviewedWords([...reviewedWords, currentWord.id]);
    }
    nextCard();
  };

  const endSession = () => {
    const accuracy = words.length > 0 ? Math.round((correctWords.length / words.length) * 100) : 0;
    Alert.alert(
      'Session Complete! 🎉',
      `Great job! You reviewed ${words.length} words with ${accuracy}% accuracy.\n\nCorrect: ${correctWords.length}\nTotal: ${words.length}`,
      [
        { text: 'Review Again', onPress: resetSession },
        { text: 'Done', onPress: () => {} },
      ]
    );
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedWords([]);
    setCorrectWords([]);
    cardRotation.setValue(0);
    translateX.setValue(0);
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      const threshold = width * 0.3;

      if (translationX > threshold) {
        markAsCorrect();
      } else if (translationX < -threshold) {
        markAsIncorrect();
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading flashcards...</Text>
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

  if (words.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noWordsTitle}>No words yet! 📚</Text>
        <Text style={styles.noWordsText}>Add some words to {currentChild.name}'s vocabulary to start practicing with flashcards.</Text>
      </View>
    );
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  const frontRotation = cardRotation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backRotation = cardRotation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎴 Flashcards</Text>
        <Text style={styles.subtitle}>Practice words with {currentChild.name}</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} of {words.length}
          </Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View
            style={[
              styles.card,
              {
                transform: [
                  { translateX },
                  { perspective: 1000 },
                ]
              }
            ]}
          >
            <Animated.View
              style={[
                styles.cardFront,
                {
                  transform: [{ rotateY: frontRotation }],
                  opacity: isFlipped ? 0 : 1,
                }
              ]}
            >
              <Text style={styles.wordText}>{currentWord.word}</Text>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.flipButton}
                  onPress={flipCard}
                >
                  <Text style={styles.flipButtonText}>Flip Card</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.cardBack,
                {
                  transform: [{ rotateY: backRotation }],
                  opacity: isFlipped ? 1 : 0,
                }
              ]}
            >
              <View style={styles.cardBackContent}>
                <Text style={styles.categoryLabel}>Category:</Text>
                <Text style={styles.categoryText}>
                  {currentWord.word_categories?.name || 'Unknown'}
                </Text>
                
                <Text style={styles.dateLabel}>Learned:</Text>
                <Text style={styles.dateText}>
                  {new Date(currentWord.date_learned).toLocaleDateString()}
                </Text>

                {currentWord.notes && (
                  <>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{currentWord.notes}</Text>
                  </>
                )}

                <TouchableOpacity
                  style={styles.flipButton}
                  onPress={flipCard}
                >
                  <Text style={styles.flipButtonText}>Flip Back</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </PanGestureHandler>

        <View style={styles.swipeHints}>
          <View style={styles.swipeHint}>
            <Text style={styles.swipeHintEmoji}>👈</Text>
            <Text style={styles.swipeHintText}>Swipe left if incorrect</Text>
          </View>
          <View style={styles.swipeHint}>
            <Text style={styles.swipeHintEmoji}>👉</Text>
            <Text style={styles.swipeHintText}>Swipe right if correct</Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, styles.incorrectButton]}
          onPress={markAsIncorrect}
        >
          <Text style={styles.controlButtonText}>❌ Incorrect</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.correctButton]}
          onPress={markAsCorrect}
        >
          <Text style={styles.controlButtonText}>✅ Correct</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navigationControls}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={previousCard}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navButtonText}>← Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetSession}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, currentIndex === words.length - 1 && styles.navButtonDisabled]}
          onPress={nextCard}
          disabled={currentIndex === words.length - 1}
        >
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  noWordsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  noWordsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
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
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: width - 40,
    height: 300,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cardFront: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 20,
    backfaceVisibility: 'hidden',
  },
  wordText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 16,
  },
  speakButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  speakButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  flipButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  flipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardBackContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  swipeHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  swipeHint: {
    alignItems: 'center',
  },
  swipeHintEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  swipeHintText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  incorrectButton: {
    backgroundColor: '#FF3B30',
  },
  correctButton: {
    backgroundColor: '#34C759',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  navButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  navButtonDisabled: {
    backgroundColor: '#ccc',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  resetButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default FlashcardsScreen;