import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { supabase } from '../lib/supabase';
import { fetchMessages } from '../lib/supabase-functions';
import { generateChatResponse, sendUserMessage } from './chat-response';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  created_at: string;
  icon?: string;
  color?: string;
};

const MESSAGES_PER_PAGE = 20;

// Import coachItems from coach.tsx
const coachItems = [
  { icon: '💬', title: 'Ask me anything', color: '#8A2BE2' },
  { icon: '🔥', title: 'Improve your overall', color: '#FF4500' },
  { icon: '💪', title: 'Gain more muscle', color: '#20B2AA' },
  { icon: '🧍', title: 'Lose body fat', color: '#FF69B4' },
  { icon: '🧴', title: 'Get clear skin', color: '#32CD32' },
  { icon: '🗿', title: 'Sharpen your jawline', color: '#4169E1' },
];

export default function ChatScreen() {
  const { initialMessage, icon, color } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchUserId() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await loadMessages(user.id, true);
        if (initialMessage) {
          await sendMessage(decodeURIComponent(initialMessage as string), user.id, icon as string, color as string);
        }
      }
    }
    fetchUserId();
  }, [initialMessage, icon, color]);

  const loadMessages = useCallback(async (userId: string, initial = false) => {
    if (isLoading || (!initial && !hasMore)) return;
    setIsLoading(true);
    try {
      const fetchedMessages = await fetchMessages(userId, page, MESSAGES_PER_PAGE);
      if (fetchedMessages.length < MESSAGES_PER_PAGE) {
        setHasMore(false);
      }
      setMessages(prevMessages => initial ? fetchedMessages : [...prevMessages, ...fetchedMessages]);
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page]);

  const userHapticFeedback = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const aiHapticFeedback = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const sendMessage = async (text: string, userId: string, messageIcon?: string, messageColor?: string) => {
    if (text.trim() && userId) {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        text: text.trim(),
        sender: 'user',
        created_at: new Date().toISOString(),
        icon: messageIcon,
        color: messageColor,
      };
      setMessages(prevMessages => [newUserMessage, ...prevMessages]);

      await userHapticFeedback();

      await sendUserMessage(text, userId);

      const apiMessages = [newUserMessage, ...messages].slice(0, 10).reverse().map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const aiResponse = await generateChatResponse(apiMessages, userId);
      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        created_at: new Date().toISOString(),
      };
      setMessages(prevMessages => [newAiMessage, ...prevMessages]);

      await aiHapticFeedback();
    }
  };

  const handleSendMessage = () => {
    if (userId) {
      sendMessage(inputText, userId);
      setInputText('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.sender === 'user' && item.text.match(/^~~.*~~$/)) {
      const subject = item.text.replace(/^~~(.*)~~$/, '$1');
      const coachItem = coachItems.find(ci => ci.title === subject) || coachItems[0];
      return (
        <View style={[styles.messageBubble, styles.userMessage, styles.coachItem]}>
          <View style={[
            styles.iconContainer, 
            { backgroundColor: coachItem.color },
            { borderColor: coachItem.color }
          ]}>
            <Text style={styles.icon}>{coachItem.icon}</Text>
          </View>
          <Text style={styles.itemText}>{subject}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageBubble, item.sender === 'user' ? styles.userMessage : styles.aiMessage]}>
        {item.sender === 'user' ? (
          <Text style={styles.messageText}>{item.text}</Text>
        ) : (
          <Markdown style={markdownStyles}>{item.text}</Markdown>
        )}
      </View>
    );
  };

  const renderLoader = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#8A2BE2" />;
    }
    return null;
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.topicTitle}>Coach Chat</Text>
        </View>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          onEndReached={() => userId && loadMessages(userId)}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderLoader}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
    
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20, // Added top margin

  },
  backButton: {
    padding: 10,
  },
  topicTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#8A2BE2',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A1A1A',
  },
  messageText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    color: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#8A2BE2',
    borderRadius: 20,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2, // Add border width
  },
  icon: {
    fontSize: 24,
    color: 'white',
  },
  itemText: {
    fontSize: 18,
    color: 'white',
    marginLeft: 15,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: 'white',
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  paragraph: {
    color: 'white',
  },
  link: {
    color: '#8A2BE2',
  },
  listItem: {
    color: 'white',
  },
  // Add more styles as needed for other markdown elements
});
