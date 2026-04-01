import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Platform } from 'react-native';
import { Colors } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';

export default function Toast() {
  const { toastMessage, toastVisible } = useApp();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toastVisible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: Platform.OS !== 'web', tension: 80, friction: 12 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();
    }
  }, [toastVisible, translateY, opacity]);

  if (!toastMessage) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }], opacity }]} pointerEvents="none">
      <View style={styles.toast}>
        <Text style={styles.text}>{toastMessage}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },
  text: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
});
