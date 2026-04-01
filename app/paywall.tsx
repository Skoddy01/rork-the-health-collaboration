import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Sparkles, BookOpen, Zap, Shield, Download } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/providers/AppProvider';
import LineHeartIcon from '@/components/LineHeartIcon';
console.log("[Paywall] Screen loaded");


const features = [
  { icon: Sparkles, label: 'Advanced Mind Training Programs', color: Colors.mind },
  { icon: Zap, label: 'Pro Workout Library & Custom Plans', color: Colors.exercise },
  { icon: BookOpen, label: 'Macro Calculator & Meal Plans', color: Colors.diet },
  { icon: Shield, label: 'AI-Powered Supplement Stacks', color: Colors.supplements },
  { icon: Download, label: 'Downloadable Wellness Ebook', color: Colors.primary },
  { icon: null, label: 'Premium Journal & Analytics', color: Colors.premium },
];

const CONFETTI_COLORS = [Colors.premium, Colors.mind, Colors.exercise, Colors.diet, Colors.supplements, Colors.primary, '#FF6B6B', '#FFD93D'];
const CONFETTI_COUNT = 240;
const CONFETTI_PIECES = Array.from({ length: CONFETTI_COUNT }).map((_, i) => ({
  left: Math.random() * 100,
  size: 5 + Math.random() * 10,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  rotation: 360 + Math.random() * 720,
  delay: Math.random() * 400,
  drift: (Math.random() - 0.5) * 80,
}));

export default function PaywallScreen() {
  const router = useRouter();
  const { purchasePremium, purchaseState } = useApp();
  const colors = useColors();
  const confettiAnims = useRef(CONFETTI_PIECES.map(() => new Animated.Value(0))).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (purchaseState === 'success') {
      Animated.parallel([
        Animated.spring(successScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(successOpacity, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();

      const confettiAnimations = confettiAnims.map((anim, i) =>
        Animated.sequence([
          Animated.delay(CONFETTI_PIECES[i].delay),
          Animated.timing(anim, { toValue: 1, duration: 1400, useNativeDriver: Platform.OS !== 'web' }),
        ])
      );
      Animated.stagger(30, confettiAnimations).start();

      autoDismissTimer.current = setTimeout(() => {
        try {
          router.replace('/(tabs)/home');
        } catch {
          console.log('Navigation failed on auto-dismiss');
        }
      }, 5000);
    }

    return () => {
      if (autoDismissTimer.current) {
        clearTimeout(autoDismissTimer.current);
      }
    };
  }, [purchaseState]);

  if (purchaseState === 'success') {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['rgba(245,197,66,0.08)', 'transparent', 'rgba(200,232,110,0.05)']}
          style={StyleSheet.absoluteFill}
        />
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={22} color={Colors.textSecondary} />
        </TouchableOpacity>

        <Animated.View style={[styles.successContent, { transform: [{ scale: successScale.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]}>
          <View style={styles.successIconWrap}>
            <LineHeartIcon size={48} color="#FFFFFF" strokeWidth={1.2} />
          </View>
          <Text style={styles.successTitle}>Welcome to Premium!</Text>
          <Text style={styles.successSubtitle}>All premium features are now unlocked. Your wellness journey just leveled up.</Text>

          <View style={styles.successActions}>
            <TouchableOpacity style={styles.ebookBtn} activeOpacity={0.8}>
              <Download size={18} color={Colors.textInverse} />
              <Text style={styles.ebookBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Download Ebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.replace('/(tabs)/home')}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreBtnText}>Start Exploring</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {CONFETTI_PIECES.map((piece, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confettiPiece,
              {
                left: `${piece.left}%`,
                width: piece.size,
                height: piece.size * (i % 3 === 0 ? 1 : 1.8),
                backgroundColor: piece.color,
                borderRadius: i % 4 === 0 ? piece.size / 2 : 2,
                transform: [
                  {
                    translateY: confettiAnims[i].interpolate({
                      inputRange: [0, 0.3, 1],
                      outputRange: [-60, 200, 900],
                    }),
                  },
                  {
                    translateX: confettiAnims[i].interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, piece.drift, piece.drift * 1.5],
                    }),
                  },
                  {
                    rotate: confettiAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', `${piece.rotation}deg`],
                    }),
                  },
                  {
                    scaleX: confettiAnims[i].interpolate({
                      inputRange: [0, 0.2, 0.5, 0.8, 1],
                      outputRange: [1, 1.2, 0.8, 1.1, 0.6],
                    }),
                  },
                ],
                opacity: confettiAnims[i].interpolate({
                  inputRange: [0, 0.05, 0.7, 1],
                  outputRange: [0, 1, 1, 0],
                }),
              },
            ]}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['rgba(245,197,66,0.06)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <X size={22} color={Colors.textSecondary} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.crownWrap}>
            <LineHeartIcon size={36} color="#FFFFFF" strokeWidth={1.2} />
          </View>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>Unlock the full Health Collaboration experience with lifetime access to all premium features.</Text>
        </View>

        <View style={styles.featuresList}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <View key={index} style={styles.featureRow}>
                <View style={[styles.featureIconWrap, { backgroundColor: feature.color + '18' }]}>
                  {Icon ? <Icon size={16} color={feature.color} /> : <LineHeartIcon size={16} color="#FFFFFF" strokeWidth={1.8} />}
                </View>
                <Text style={styles.featureLabel}>{feature.label}</Text>
                <View style={styles.checkmarkWrap}>
                  <Text style={styles.checkmarkText}>{"\u2713"}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.priceCard}>
          <LinearGradient
            colors={['rgba(245,197,66,0.1)', 'rgba(245,197,66,0.02)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text style={styles.priceLabel}>LIFETIME ACCESS</Text>
          <Text style={styles.price}>$29.99</Text>
          <Text style={styles.priceNote}>One-time payment</Text>
          <View style={styles.priceDivider} />
          <Text style={styles.priceCompare}>No subscriptions</Text>
          <Text style={styles.priceCompare}>No hidden fees</Text>
          <Text style={styles.priceCompare}>Forever</Text>
        </View>

        <TouchableOpacity
          style={[styles.purchaseBtn, purchaseState === 'loading' && styles.purchaseBtnLoading]}
          onPress={purchasePremium}
          disabled={purchaseState === 'loading'}
          activeOpacity={0.8}
          testID="paywall-purchase-btn"
        >
          {purchaseState === 'loading' ? (
            <ActivityIndicator color={Colors.textInverse} />
          ) : (
            <>
              <LineHeartIcon size={20} color="#FFFFFF" strokeWidth={1.8} />
              <Text style={styles.purchaseBtnText}>Unlock THC Premium</Text>
            </>
          )}
        </TouchableOpacity>

        {purchaseState === 'error' && (
          <Text style={styles.errorText}>Purchase failed. Please try again.</Text>
        )}

        <Text style={styles.termsText}>
          By purchasing, you agree to our Terms of Service and Privacy Policy. Lifetime access means access for the lifetime of the product.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  crownWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.premiumMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  featuresList: {
    gap: 10,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  featureIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  checkmarkWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(74,222,128,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '700' as const,
    marginTop: -1,
  },
  priceCard: {
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(245,197,66,0.3)',
    marginBottom: 20,
    overflow: 'hidden',
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.premium,
    letterSpacing: 2,
    marginBottom: 8,
  },

  price: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  priceNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  priceDivider: {
    width: 40,
    height: 1.5,
    backgroundColor: 'rgba(245,197,66,0.3)',
    marginBottom: 10,
  },
  priceCompare: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center' as const,
  },
  purchaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.premium,
    borderRadius: 16,
    paddingVertical: 18,
    gap: 10,
    marginBottom: 12,
  },
  purchaseBtnLoading: {
    opacity: 0.7,
  },
  purchaseBtnText: {
    color: Colors.textInverse,
    fontSize: 17,
    fontWeight: '700' as const,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  successContent: {
    alignItems: 'center',
    paddingHorizontal: 28,
    zIndex: 5,
  },
  successIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.premiumMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.premium,
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 32,
  },
  successActions: {
    width: '100%',
    gap: 12,
  },
  ebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  ebookBtnText: {
    color: Colors.textInverse,
    fontSize: 13,
    fontWeight: '700' as const,
    flexShrink: 1,
  },
  exploreBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exploreBtnText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  confettiPiece: {
    position: 'absolute',
    top: -20,
  },
});
