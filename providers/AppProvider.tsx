import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, QuizAnswer, PurchaseState, JournalEntry, AppTheme } from '@/types';
import { mockJournalEntries } from '@/constants/mock';
import { trpc, isTrpcAvailable } from '@/lib/trpc';

const STORAGE_KEYS = {
  USER: 'hal_thc_user',
  ONBOARDING_COMPLETE: 'hal_thc_onboarding',
  QUIZ_ANSWERS: 'hal_thc_quiz',
  PREMIUM: 'hal_thc_premium',
  JOURNAL: 'hal_thc_journal',
  DISCLAIMER: 'hal_thc_disclaimer',
  THEME: 'hal_thc_theme',
} as const;

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const systemColorScheme = useColorScheme();

  const [user, setUser] = useState<User | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [purchaseState, setPurchaseState] = useState<PurchaseState>('idle');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [theme, setThemeState] = useState<AppTheme>('dark');
  const premiumSyncedRef = useRef<boolean>(false);

  const initQuery = useQuery({
    queryKey: ['app-init'],
    queryFn: async () => {
      console.log('[AppProvider] Loading persisted state...');
      const [userData, onboarding, quiz, premium, journal, disclaimer, themeData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE),
        AsyncStorage.getItem(STORAGE_KEYS.QUIZ_ANSWERS),
        AsyncStorage.getItem(STORAGE_KEYS.PREMIUM),
        AsyncStorage.getItem(STORAGE_KEYS.JOURNAL),
        AsyncStorage.getItem(STORAGE_KEYS.DISCLAIMER),
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
      ]);
      return { userData, onboarding, quiz, premium, journal, disclaimer, themeData };
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (initQuery.data) {
      const { userData, onboarding, quiz, premium, journal, disclaimer, themeData } = initQuery.data;
      if (userData) setUser(JSON.parse(userData));
      if (onboarding === 'true') setOnboardingComplete(true);
      if (disclaimer) {
        try {
          const parsed = JSON.parse(disclaimer);
          if (parsed.disclaimerAgreed) setDisclaimerAgreed(true);
        } catch { /* ignore */ }
      }
      if (quiz) setQuizAnswers(JSON.parse(quiz));
      if (premium === 'true') setIsPremium(true);
      if (journal) {
        setJournalEntries(JSON.parse(journal));
      } else {
        setJournalEntries(mockJournalEntries);
      }
      if (themeData === 'dark' || themeData === 'light' || themeData === 'system') {
        setThemeState(themeData);
      }
      setIsReady(true);
      console.log('[AppProvider] State loaded successfully');
    }
  }, [initQuery.data]);

  const premiumStatusQuery = trpc.premium.getStatus.useQuery(
    { userId: user?.id ?? '' },
    {
      enabled: isTrpcAvailable && !!user?.id && isReady,
      staleTime: 1000 * 60 * 5,
      retry: 2,
    }
  );

  useEffect(() => {
    if (premiumStatusQuery.data && !premiumSyncedRef.current) {
      const serverPremium = premiumStatusQuery.data.isPremium;
      console.log('[AppProvider] Server premium status:', serverPremium);

      if (serverPremium && !isPremium) {
        console.log('[AppProvider] Restoring premium from server');
        setIsPremium(true);
        AsyncStorage.setItem(STORAGE_KEYS.PREMIUM, 'true');
        if (user) {
          const updatedUser = { ...user, isPremium: true };
          setUser(updatedUser);
          AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        }
      }
      premiumSyncedRef.current = true;
    }
  }, [premiumStatusQuery.data, isPremium, user]);

  const markPremiumMutation = trpc.premium.markPremium.useMutation({
    onSuccess: (data) => {
      console.log('[AppProvider] Premium persisted to server:', data);
      queryClient.invalidateQueries({ queryKey: [['premium', 'getStatus']] });
    },
    onError: (error) => {
      console.log('[AppProvider] Failed to persist premium to server:', error.message);
    },
  });

  const syncUserMutation = trpc.user.sync.useMutation({
    onSuccess: (data) => {
      console.log('[AppProvider] User synced to server:', data.user.userId);
    },
    onError: (error) => {
      console.log('[AppProvider] Failed to sync user to server:', error.message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      await AsyncStorage.setItem(key, value);
    },
  });

  const effectiveTheme = useMemo((): 'dark' | 'light' => {
    if (theme === 'system') {
      return systemColorScheme === 'light' ? 'light' : 'dark';
    }
    return theme;
  }, [theme, systemColorScheme]);

  const setTheme = useCallback((t: AppTheme) => {
    setThemeState(t);
    saveMutation.mutate({ key: STORAGE_KEYS.THEME, value: t });
    console.log('[AppProvider] Theme set to:', t);
  }, [saveMutation]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('[AppProvider] Signing in:', email);
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
      isPremium: false,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setOnboardingComplete(true);
    premiumSyncedRef.current = false;
    saveMutation.mutate({ key: STORAGE_KEYS.USER, value: JSON.stringify(newUser) });
    saveMutation.mutate({ key: STORAGE_KEYS.ONBOARDING_COMPLETE, value: 'true' });
    syncUserMutation.mutate({ userId: newUser.id, email: newUser.email, name: newUser.name });
    showToast('Welcome to The Health Collaboration!');
  }, [saveMutation, showToast, syncUserMutation]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    console.log('[AppProvider] Signing up:', email);
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      isPremium: false,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setOnboardingComplete(true);
    premiumSyncedRef.current = false;
    saveMutation.mutate({ key: STORAGE_KEYS.USER, value: JSON.stringify(newUser) });
    saveMutation.mutate({ key: STORAGE_KEYS.ONBOARDING_COMPLETE, value: 'true' });
    syncUserMutation.mutate({ userId: newUser.id, email: newUser.email, name: newUser.name });
    showToast('Account created successfully!');
  }, [saveMutation, showToast, syncUserMutation]);

  const signOut = useCallback(async () => {
    console.log('[AppProvider] Signing out');
    setUser(null);
    setOnboardingComplete(false);
    setQuizAnswers([]);
    setIsPremium(false);
    premiumSyncedRef.current = false;
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    showToast('Signed out');
  }, [showToast]);

  const completeOnboarding = useCallback(() => {
    setOnboardingComplete(true);
    saveMutation.mutate({ key: STORAGE_KEYS.ONBOARDING_COMPLETE, value: 'true' });
    console.log('[AppProvider] Onboarding completed');
  }, [saveMutation]);

  const saveQuizAnswers = useCallback((answers: QuizAnswer[]) => {
    setQuizAnswers(answers);
    saveMutation.mutate({ key: STORAGE_KEYS.QUIZ_ANSWERS, value: JSON.stringify(answers) });
    if (user) {
      syncUserMutation.mutate({
        userId: user.id,
        email: user.email,
        name: user.name,
        quizAnswers: answers,
      });
    }
    console.log('[AppProvider] Quiz answers saved:', answers.length);
  }, [saveMutation, user, syncUserMutation]);

  const purchasePremium = useCallback(async () => {
    console.log('[AppProvider] Starting premium purchase...');
    setPurchaseState('loading');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsPremium(true);
      setPurchaseState('success');
      saveMutation.mutate({ key: STORAGE_KEYS.PREMIUM, value: 'true' });

      if (user) {
        const updatedUser = { ...user, isPremium: true };
        setUser(updatedUser);
        saveMutation.mutate({ key: STORAGE_KEYS.USER, value: JSON.stringify(updatedUser) });
        markPremiumMutation.mutate({ userId: user.id });
      }

      showToast('Welcome to The Health Collaboration Premium!');
      setTimeout(() => setPurchaseState('idle'), 4000);
    } catch {
      setPurchaseState('error');
      showToast('Purchase failed. Please try again.');
      setTimeout(() => setPurchaseState('idle'), 3000);
    }
  }, [user, saveMutation, showToast, markPremiumMutation]);

  const addJournalEntry = useCallback((entry: JournalEntry) => {
    const updated = [entry, ...journalEntries];
    setJournalEntries(updated);
    saveMutation.mutate({ key: STORAGE_KEYS.JOURNAL, value: JSON.stringify(updated) });
    showToast('Journal entry saved');
  }, [journalEntries, saveMutation, showToast]);

  const updateProfile = useCallback((updates: { firstName?: string; lastName?: string; email?: string }) => {
    if (!user) return;
    const newName = (updates.firstName && updates.lastName)
      ? `${updates.firstName} ${updates.lastName}`
      : updates.firstName || updates.lastName || user.name;
    const updatedUser: User = {
      ...user,
      firstName: updates.firstName ?? user.firstName,
      lastName: updates.lastName ?? user.lastName,
      email: updates.email ?? user.email,
      name: newName,
    };
    setUser(updatedUser);
    saveMutation.mutate({ key: STORAGE_KEYS.USER, value: JSON.stringify(updatedUser) });
    if (isTrpcAvailable) {
      syncUserMutation.mutate({ userId: updatedUser.id, email: updatedUser.email, name: updatedUser.name });
    }
    showToast('Profile updated');
    console.log('[AppProvider] Profile updated:', updatedUser.name, updatedUser.email);
  }, [user, saveMutation, showToast, syncUserMutation]);

  return useMemo(() => ({
    user,
    isReady,
    disclaimerAgreed,
    onboardingComplete,
    quizAnswers,
    isPremium,
    purchaseState,
    journalEntries,
    theme,
    effectiveTheme,
    setTheme,
    toastMessage,
    toastVisible,
    signIn,
    signUp,
    signOut,
    completeOnboarding,
    saveQuizAnswers,
    purchasePremium,
    addJournalEntry,
    updateProfile,
    showToast,
  }), [
    user, isReady, disclaimerAgreed, onboardingComplete, quizAnswers, isPremium,
    purchaseState, journalEntries, theme, effectiveTheme, toastMessage, toastVisible,
    signIn, signUp, signOut, completeOnboarding, saveQuizAnswers,
    purchasePremium, addJournalEntry, updateProfile, setTheme, showToast,
  ]);
});
