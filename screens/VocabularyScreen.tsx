import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Keyboard,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import {
  useSpeechRecognitionEvent,
  ExpoSpeechRecognitionModule,
} from 'expo-speech-recognition';
import { useChild } from '../contexts/ChildContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Tables } from '../integrations/supabase/types';
import { updateVocabularyMilestones, getMilestoneAchievedMessage } from '../lib/milestone-helpers';

const LANGUAGE_STORAGE_KEY = '@voice_recognition_language';

interface Word extends Tables<'words'> {
  word_categories?: Tables<'word_categories'>;
}

interface Category extends Tables<'word_categories'> {}

const VocabularyScreen = () => {
  const { currentChild } = useChild();
  const { user } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newWordCategory, setNewWordCategory] = useState('');
  const [autoCategories, setAutoCategories] = useState<string[]>([]);
    // Fonction pour récupérer la catégorie sémantique via ConceptNet
    async function getConceptNetCategory(word: string): Promise<string[]> {
      const url = `https://api.conceptnet.io/query?node=/c/fr/${encodeURIComponent(word)}&rel=/r/IsA&limit=5`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        const categories = data.edges.map((edge: any) => edge.end.label);
        return categories;
      } catch (e) {
        console.error('ConceptNet error:', e);
        return [];
      }
    }
  const [addingWord, setAddingWord] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const wordInputRef = useRef<TextInput>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Speech recognition listener
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      setNewWord(transcript);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
    Alert.alert('Voice Error', 'Could not recognize speech. Please try again.');
  });

  useEffect(() => {
    if (currentChild && user) {
      fetchData();
    }
  }, [currentChild, user]);

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);

    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowToast(false);
    });
  };

  const fetchData = async () => {
    if (!currentChild || !user) return;

    try {
      setLoading(true);
      
      const [wordsResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('words')
          .select(`
            *,
            word_categories (*)
          `)
          .eq('child_id', currentChild.id)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('word_categories')
          .select('*')
          .order('name')
      ]);

      if (wordsResponse.error) {
        console.error('Error fetching words:', wordsResponse.error);
        Alert.alert('Error', 'Failed to load words');
      } else {
        setWords(wordsResponse.data || []);
      }

      if (categoriesResponse.error) {
        console.error('Error fetching categories:', categoriesResponse.error);
      } else {
        setCategories(categoriesResponse.data || []);
        if (categoriesResponse.data && categoriesResponse.data.length > 0) {
          setNewWordCategory(categoriesResponse.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const addWord = async () => {
    if (!newWord.trim() || !currentChild || !user) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setAddingWord(true);
    const wordToAdd = newWord.trim();

    // 1. Récupérer la catégorie sémantique automatiquement
    let autoCategory = '';
    let autoCategoryId = '';
    try {
      const categoriesFound = await getConceptNetCategory(wordToAdd);
      setAutoCategories(categoriesFound);
      if (categoriesFound.length > 0) {
        autoCategory = categoriesFound[0];
        // Vérifier si la catégorie existe déjà dans la DB
        let categoryRow = categories.find(c => c.name.toLowerCase() === autoCategory.toLowerCase());
        if (!categoryRow) {
          // Créer la catégorie si elle n'existe pas
          const { data: newCat, error: catError } = await supabase.from('word_categories').insert({
            name: autoCategory,
            color: '#34C759', // couleur par défaut
          }).select();
          if (catError) {
            console.error('Error creating category:', catError);
          }
          categoryRow = newCat?.[0];
        }
        autoCategoryId = categoryRow?.id || '';
      }
    } catch (e) {
      console.error('ConceptNet categorization failed:', e);
    }

    // 2. Utiliser la catégorie auto si trouvée, sinon celle sélectionnée manuellement
    const finalCategoryId = autoCategoryId || newWordCategory;

    try {
      const { error } = await supabase.from('words').insert({
        word: wordToAdd,
        category_id: finalCategoryId,
        child_id: currentChild.id,
        user_id: user.id,
        date_learned: new Date().toISOString().split('T')[0],
      });

      if (error) {
        console.error('Error adding word:', error);
        Alert.alert('Error', 'Failed to add word');
      } else {
        setNewWord('');
        setNewWordCategory('');
        setShowAddModal(false);
        await fetchData();
        try {
          await updateVocabularyMilestones(currentChild.id, user.id);
          const { data: milestones } = await supabase
            .from('milestones')
            .select('*')
            .eq('child_id', currentChild.id)
            .eq('user_id', user.id)
            .eq('milestone_type', 'vocabulary')
            .eq('achieved', true);
          const { data: wordsCount } = await supabase
            .from('words')
            .select('id')
            .eq('child_id', currentChild.id)
            .eq('user_id', user.id);
          const totalWords = wordsCount?.length || 0;
          const justAchievedMilestone = milestones?.find(
            m => m.target_value === totalWords
          );
          if (justAchievedMilestone) {
            Alert.alert(
              '🎉 Milestone Achieved!',
              getMilestoneAchievedMessage(justAchievedMilestone.title),
              [{ text: 'Awesome!', style: 'default' }]
            );
          } else {
            showToastMessage(`✓ Added "${wordToAdd}"`);
          }
        } catch (err) {
          console.error('Error updating milestones:', err);
          showToastMessage(`✓ Added "${wordToAdd}"`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setAddingWord(false);
    }
  };

  const deleteWord = (word: Word) => {
    Alert.alert(
      'Delete Word',
      `Are you sure you want to delete "${word.word}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('words')
                .delete()
                .eq('id', word.id);

              if (error) {
                console.error('Error deleting word:', error);
                Alert.alert('Error', 'Failed to delete word');
              } else {
                await fetchData();
                // Update milestones after deletion
                if (currentChild && user) {
                  await updateVocabularyMilestones(currentChild.id, user.id);
                }
              }
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('Error', 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const filteredWords = words.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || word.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#007AFF';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const handleOpenAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    // Reset form when closing modal
    setNewWord('');
    setNewWordCategory('');
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading vocabulary...</Text>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search words..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'All' && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory('All')}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'All' && styles.selectedCategoryButtonText,
            ]}>
              All ({words.length})
            </Text>
          </TouchableOpacity>
          
          {categories.map(category => {
            const count = words.filter(w => w.category_id === category.id).length;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.selectedCategoryButton,
                  { borderColor: category.color }
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.selectedCategoryButtonText,
                ]}>
                  {category.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleOpenAddModal}
        >
          <Text style={styles.addButtonText}>+ Add Word</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.wordsList}>
        {filteredWords.length > 0 ? (
          filteredWords.map(word => (
            <View key={word.id} style={styles.wordCard}>
              <View style={styles.wordHeader}>
                <Text style={styles.wordText}>{word.word}</Text>
                <View 
                  style={[
                    styles.categoryTag, 
                    { backgroundColor: getCategoryColor(word.category_id || '') }
                  ]}
                >
                  <Text style={styles.categoryTagText}>
                    {getCategoryName(word.category_id || '')}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.dateText}>
                Learned: {new Date(word.date_learned).toLocaleDateString()}
              </Text>
              
              {word.notes && (
                <Text style={styles.notesText}>{word.notes}</Text>
              )}
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deleteWord(word)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchTerm ? 'No words found matching your search' : 'No words added yet'}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.emptyButtonText}>Add First Word</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={handleCloseAddModal}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Word</Text>
            <TouchableOpacity
              onPress={addWord}
              style={styles.modalSaveButton}
              disabled={addingWord}
            >
              {addingWord ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Text style={styles.modalSaveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Word</Text>
              <View style={styles.wordInputContainer}>
                <TextInput
                  ref={wordInputRef}
                  style={styles.modalInput}
                  placeholder="Type or say the word..."
                  value={newWord}
                  onChangeText={setNewWord}
                  autoFocus
                  returnKeyType="done"
                  enablesReturnKeyAutomatically
                />
                <TouchableOpacity
                  style={[styles.micButton, isListening && styles.micButtonActive]}
                  onPress={async () => {
                    if (isListening) {
                      // Stop listening
                      ExpoSpeechRecognitionModule.stop();
                      setIsListening(false);
                    } else {
                      // Start listening
                      try {
                        const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
                        if (!result.granted) {
                          Alert.alert(
                            'Permission Required',
                            'Please enable microphone access in Settings to use voice input.',
                            [{ text: 'OK' }]
                          );
                          return;
                        }

                        setIsListening(true);
                        ExpoSpeechRecognitionModule.start({
                          lang: selectedLanguage,
                          interimResults: true,
                          maxAlternatives: 1,
                          continuous: false,
                          requiresOnDeviceRecognition: false,
                        });
                      } catch (error) {
                        console.error('Speech recognition error:', error);
                        Alert.alert('Error', 'Could not start voice recognition.');
                        setIsListening(false);
                      }
                    }
                  }}
                >
                  <Ionicons
                    name={isListening ? "mic" : "mic-outline"}
                    size={24}
                    color={isListening ? "#FF3B30" : "#007AFF"}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.voiceHintText}>
                {isListening ? '🎤 Listening... Speak now!' : '💡 Tap the microphone to use voice input'}
              </Text>
              <Text style={styles.voiceLanguageHint}>
                Change voice language in Settings
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.modalCategoryButton,
                      { backgroundColor: category.color },
                      newWordCategory === category.id && styles.selectedModalCategory,
                    ]}
                    onPress={() => setNewWordCategory(category.id)}
                  >
                    <Text style={styles.modalCategoryButtonText}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      {showToast && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastOpacity,
            },
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
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
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  wordsList: {
    flex: 1,
    padding: 16,
  },
  wordCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wordText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  deleteButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSaveButton: {
    padding: 8,
  },
  modalSaveText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  wordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    paddingRight: 8,
  },
  modalInput: {
    flex: 1,
    padding: 16,
    fontSize: 18,
  },
  micButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  micButtonActive: {
    backgroundColor: '#FF3B3020',
  },
  voiceHintText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  voiceLanguageHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalCategoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  selectedModalCategory: {
    transform: [{ scale: 1.1 }],
  },
  modalCategoryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default VocabularyScreen;