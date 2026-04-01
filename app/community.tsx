import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Send,
  Hash,
  Users,
  Lock,
  ChevronLeft,
  MessageCircle,
  Heart,
  Sparkles,
  Brain,
  Dumbbell,
  Moon,
  Smile,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/providers/AppProvider';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
console.log("[Community] Screen loaded");


interface Channel {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_premium: boolean;
  member_count?: number;
}

interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name: string;
  user_avatar: string | null;
}

const DEFAULT_CHANNELS: Channel[] = [
  { id: 'general', name: 'General', description: 'Welcome! Say hello to the community', icon: 'message', is_premium: false, member_count: 142 },
  { id: 'mindfulness', name: 'Mindfulness', description: 'Share meditation tips & experiences', icon: 'brain', is_premium: false, member_count: 89 },
  { id: 'fitness', name: 'Fitness', description: 'Workout motivation & progress', icon: 'dumbbell', is_premium: false, member_count: 67 },
  { id: 'sleep', name: 'Better Sleep', description: 'Sleep routines & wind-down rituals', icon: 'moon', is_premium: true, member_count: 45 },
  { id: 'coaching', name: 'Coach Q&A', description: 'Ask our wellness coaches anything', icon: 'sparkles', is_premium: true, member_count: 31 },
  { id: 'gratitude', name: 'Gratitude', description: 'Daily gratitude sharing circle', icon: 'heart', is_premium: true, member_count: 58 },
];

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  'message': <MessageCircle size={18} color="#C8E86E" />,
  'brain': <Brain size={18} color="#A78BFA" />,
  'dumbbell': <Dumbbell size={18} color="#FB923C" />,
  'moon': <Moon size={18} color="#60A5FA" />,
  'sparkles': <Sparkles size={18} color="#F5C542" />,
  'heart': <Heart size={18} color="#EC4899" />,
};

const CHANNEL_ACCENT: Record<string, string> = {
  'general': '#C8E86E',
  'mindfulness': '#A78BFA',
  'fitness': '#FB923C',
  'sleep': '#60A5FA',
  'coaching': '#F5C542',
  'gratitude': '#EC4899',
};

const SAMPLE_MESSAGES: Record<string, Message[]> = {
  'general': [
    { id: '1', channel_id: 'general', user_id: 'u1', content: 'Hey everyone! Just started my wellness journey this week. Any tips for staying consistent?', created_at: new Date(Date.now() - 3600000 * 5).toISOString(), user_name: 'Sarah M.', user_avatar: null },
    { id: '2', channel_id: 'general', user_id: 'u2', content: 'Welcome Sarah! Start small — even 5 minutes of mindfulness daily adds up. The session builder here is amazing for that.', created_at: new Date(Date.now() - 3600000 * 4).toISOString(), user_name: 'James K.', user_avatar: null },
    { id: '3', channel_id: 'general', user_id: 'u3', content: 'Agreed! I do morning breathing + evening journal. Game changer after a month 🌿', created_at: new Date(Date.now() - 3600000 * 2).toISOString(), user_name: 'Priya R.', user_avatar: null },
    { id: '4', channel_id: 'general', user_id: 'u4', content: 'Day 14 of my streak! Never thought I\'d actually stick with meditation. This community helps so much.', created_at: new Date(Date.now() - 3600000).toISOString(), user_name: 'Tom W.', user_avatar: null },
  ],
  'mindfulness': [
    { id: '5', channel_id: 'mindfulness', user_id: 'u2', content: 'Just finished a 20-min session using the Rainbird voice. Her tone is so calming.', created_at: new Date(Date.now() - 7200000).toISOString(), user_name: 'James K.', user_avatar: null },
    { id: '6', channel_id: 'mindfulness', user_id: 'u5', content: 'Has anyone tried the 4-7-8 breathing when anxious? It genuinely works within 3 cycles for me.', created_at: new Date(Date.now() - 5400000).toISOString(), user_name: 'Mia L.', user_avatar: null },
    { id: '7', channel_id: 'mindfulness', user_id: 'u3', content: 'The body scan section in the session builder always gets me. I hold so much tension in my shoulders without realising.', created_at: new Date(Date.now() - 1800000).toISOString(), user_name: 'Priya R.', user_avatar: null },
  ],
  'fitness': [
    { id: '8', channel_id: 'fitness', user_id: 'u4', content: 'Hit 10,000 steps for the first time in months! The pedometer feature keeps me accountable.', created_at: new Date(Date.now() - 3600000 * 3).toISOString(), user_name: 'Tom W.', user_avatar: null },
    { id: '9', channel_id: 'fitness', user_id: 'u1', content: 'Morning walks + afternoon bodyweight routine. Simple but effective. Anyone else doing something similar?', created_at: new Date(Date.now() - 3600000).toISOString(), user_name: 'Sarah M.', user_avatar: null },
  ],
};

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = ['#A78BFA', '#FB923C', '#34D399', '#60A5FA', '#EC4899', '#F5C542', '#C8E86E'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const avatarColor = useMemo(() => getAvatarColor(message.user_name), [message.user_name]);
  const initials = useMemo(() => getInitials(message.user_name), [message.user_name]);

  return (
    <View style={[msgStyles.container, isOwn && msgStyles.containerOwn]}>
      {!isOwn && (
        <View style={[msgStyles.avatar, { backgroundColor: avatarColor + '25' }]}>
          <Text style={[msgStyles.avatarText, { color: avatarColor }]}>{initials}</Text>
        </View>
      )}
      <View style={[msgStyles.bubble, isOwn && msgStyles.bubbleOwn]}>
        {!isOwn && (
          <Text style={msgStyles.senderName}>{message.user_name}</Text>
        )}
        <Text style={[msgStyles.content, isOwn && msgStyles.contentOwn]}>{message.content}</Text>
        <Text style={[msgStyles.time, isOwn && msgStyles.timeOwn]}>{formatTime(message.created_at)}</Text>
      </View>
    </View>
  );
}

const msgStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
    maxWidth: '85%',
  },
  containerOwn: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  bubble: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: '100%',
    flexShrink: 1,
  },
  bubbleOwn: {
    backgroundColor: 'rgba(200, 232, 110, 0.12)',
    borderColor: 'rgba(200, 232, 110, 0.25)',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 6,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  content: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  contentOwn: {
    color: Colors.text,
  },
  time: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeOwn: {
    color: 'rgba(200, 232, 110, 0.5)',
  },
});

export default function CommunityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isPremium } = useApp();
  const colors = useColors();
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const channels = useMemo(() => DEFAULT_CHANNELS, []);

  const currentChannel = useMemo(() =>
    channels.find(c => c.id === activeChannel),
    [channels, activeChannel]
  );

  const loadMessages = useCallback(async (channelId: string) => {
    setIsLoading(true);
    console.log('[Community] Loading messages for channel:', channelId);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('channel_id', channelId)
          .order('created_at', { ascending: true })
          .limit(50);

        if (data && data.length > 0 && !error) {
          setMessages(data as Message[]);
          setIsLoading(false);
          return;
        }
        if (error) {
          console.log('[Community] Supabase error (using fallback):', error.message);
        }
      } catch (e) {
        console.log('[Community] Supabase fetch failed (using fallback):', e);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 300));
    setMessages(SAMPLE_MESSAGES[channelId] || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!activeChannel || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`messages:${activeChannel}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${activeChannel}`,
        },
        (payload) => {
          console.log('[Community] New message received:', payload.new);
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeChannel]);

  const openChannel = useCallback((channelId: string, channelPremium: boolean) => {
    if (channelPremium && !isPremium) {
      router.push('/paywall');
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const nativeDriver = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: nativeDriver }),
      Animated.timing(slideAnim, { toValue: -15, duration: 120, useNativeDriver: nativeDriver }),
    ]).start(() => {
      setActiveChannel(channelId);
      void loadMessages(channelId);
      slideAnim.setValue(15);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: nativeDriver }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: nativeDriver }),
      ]).start();
    });
  }, [isPremium, router, fadeAnim, slideAnim, loadMessages]);

  const goBackToChannels = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const nativeDriver = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: nativeDriver }),
    ]).start(() => {
      setActiveChannel(null);
      setMessages([]);
      slideAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: nativeDriver }).start();
    });
  }, [fadeAnim, slideAnim]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !activeChannel || !user) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText('');
    setIsSending(true);

    const newMessage: Message = {
      id: Date.now().toString(),
      channel_id: activeChannel,
      user_id: user.id,
      content: text,
      created_at: new Date().toISOString(),
      user_name: user.name || 'You',
      user_avatar: null,
    };

    setMessages(prev => [...prev, newMessage]);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('messages')
          .insert({
            channel_id: activeChannel,
            user_id: user.id,
            content: text,
            user_name: user.name || 'Anonymous',
            user_avatar: null,
          });

        if (error) {
          console.log('[Community] Failed to persist message:', error.message);
        }
      } catch (e) {
        console.log('[Community] Message send error:', e);
      }
    }

    setIsSending(false);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputText, activeChannel, user]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      }, 150);
    }
  }, [messages.length]);

  const accentColor = activeChannel ? (CHANNEL_ACCENT[activeChannel] || Colors.primary) : Colors.primary;

  const renderChannelList = () => (
    <ScrollView
      style={styles.channelScroll}
      contentContainerStyle={styles.channelScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.communityHeader}>
        <View style={styles.communityIconCircle}>
          <Users size={28} color={Colors.primary} strokeWidth={1.5} />
        </View>
        <Text style={styles.communityTitle}>Wellness Community</Text>
        <Text style={styles.communitySubtitle}>
          Connect with fellow practitioners, share experiences, and grow together.
        </Text>
        <View style={styles.onlineRow}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>24 members online</Text>
        </View>
      </View>

      <Text style={styles.channelSectionLabel}>CHANNELS</Text>

      {channels.map((channel) => {
        const isLocked = channel.is_premium && !isPremium;
        return (
          <TouchableOpacity
            key={channel.id}
            style={[styles.channelCard, isLocked && styles.channelCardLocked]}
            onPress={() => openChannel(channel.id, channel.is_premium)}
            activeOpacity={0.7}
            testID={`channel-${channel.id}`}
          >
            <View style={[styles.channelIcon, { backgroundColor: (CHANNEL_ACCENT[channel.id] || Colors.primary) + '15' }]}>
              {isLocked ? <Lock size={18} color={Colors.textMuted} /> : (CHANNEL_ICONS[channel.icon] || <Hash size={18} color={Colors.primary} />)}
            </View>
            <View style={styles.channelInfo}>
              <View style={styles.channelTitleRow}>
                <Text style={[styles.channelName, isLocked && styles.channelNameLocked]}>
                  {channel.name}
                </Text>
                {isLocked && (
                  <View style={styles.premiumTag}>
                    <Text style={styles.premiumTagText}>PRO</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.channelDesc, isLocked && styles.channelDescLocked]}>
                {channel.description}
              </Text>
            </View>
            <View style={styles.channelMeta}>
              <Users size={12} color={Colors.textMuted} />
              <Text style={styles.channelCount}>{channel.member_count}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {!isPremium && (
        <TouchableOpacity
          style={styles.upgradeCard}
          onPress={() => router.push('/paywall')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(200,232,110,0.08)', 'rgba(245,197,66,0.08)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Sparkles size={18} color={Colors.premium} />
          <View style={styles.upgradeCardText}>
            <Text style={styles.upgradeCardTitle}>Unlock All Channels</Text>
            <Text style={styles.upgradeCardSub}>Premium members get access to coaching, sleep & gratitude channels</Text>
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderChat = () => (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TouchableOpacity
        style={styles.chatHeader}
        onPress={goBackToChannels}
        activeOpacity={0.7}
      >
        <ChevronLeft size={20} color={Colors.text} />
        <View style={[styles.chatHeaderIcon, { backgroundColor: accentColor + '20' }]}>
          {CHANNEL_ICONS[currentChannel?.icon || 'message'] || <Hash size={16} color={accentColor} />}
        </View>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderName}>{currentChannel?.name || 'Channel'}</Text>
          <Text style={styles.chatHeaderSub}>{currentChannel?.member_count} members</Text>
        </View>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={accentColor} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Smile size={32} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Be the first to say something!</Text>
          </View>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.user_id === user?.id}
            />
          ))
        )}
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={() => void handleSend()}
          blurOnSubmit
          testID="community-input"
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            inputText.trim().length > 0 && styles.sendBtnActive,
            { backgroundColor: inputText.trim().length > 0 ? accentColor : Colors.surfaceHighlight },
          ]}
          onPress={() => void handleSend()}
          disabled={!inputText.trim() || isSending}
          activeOpacity={0.7}
          testID="community-send"
        >
          {isSending ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <Send size={16} color={inputText.trim().length > 0 ? Colors.textInverse : Colors.textMuted} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: activeChannel ? '' : 'Community',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerShown: !activeChannel,
        }}
      />
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {activeChannel ? renderChat() : renderChannelList()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  animatedContainer: {
    flex: 1,
  },
  channelScroll: {
    flex: 1,
  },
  channelScrollContent: {
    paddingBottom: 40,
  },
  communityHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
  },
  communityIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(200,232,110,0.2)',
  },
  communityTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  communitySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  onlineText: {
    fontSize: 12,
    color: '#34D399',
    fontWeight: '600' as const,
  },
  channelSectionLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  channelCardLocked: {
    opacity: 0.6,
    borderStyle: 'dashed' as const,
  },
  channelIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelInfo: {
    flex: 1,
  },
  channelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  channelName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  channelNameLocked: {
    color: Colors.textMuted,
  },
  channelDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  channelDescLocked: {
    color: Colors.textMuted,
  },
  premiumTag: {
    backgroundColor: Colors.premiumMuted,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  premiumTagText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.premium,
  },
  channelMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  channelCount: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,197,66,0.2)',
    overflow: 'hidden',
  },
  upgradeCardText: {
    flex: 1,
  },
  upgradeCardTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.premium,
  },
  upgradeCardSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  chatHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  chatHeaderSub: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  sendBtnActive: {
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 3,
  },
});
