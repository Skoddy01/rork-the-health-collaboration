import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Brain, Dumbbell, Apple, Pill } from 'lucide-react-native';

interface THCLogoProps {
  size?: number;
}

export default function THCLogo({ size = 100 }: THCLogoProps) {
  const innerSize = Math.round(size * 0.82);
  const iconSize = Math.round(size * 0.21);
  const inset = Math.round(innerSize * 0.10);

  return (
    <View
      style={[
        styles.outer,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
        },
      ]}
    >
      <View
        style={{
          width: innerSize,
          height: innerSize,
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={[styles.lineH, { width: '82%' }]} />
        <View style={[styles.lineV, { height: '82%' }]} />

        {/* Top LHS — Mind */}
        <View style={[styles.corner, { top: inset, left: inset }]}>
          <Brain size={iconSize} color="#8B5CF6" strokeWidth={2.5} />
        </View>

        {/* Top RHS — Exercise */}
        <View style={[styles.corner, { top: inset, right: inset }, { transform: [{ rotate: '90deg' }] }]}>
          <Dumbbell size={iconSize} color="#F97316" strokeWidth={2.5} />
        </View>

        {/* Bottom LHS — Supplements (swapped) */}
        <View style={[styles.corner, { bottom: inset, left: inset }, { transform: [{ rotate: '180deg' }] }]}>
          <Pill size={iconSize} color="#38BDF8" strokeWidth={2.5} />
        </View>

        {/* Bottom RHS — Diet (swapped) */}
        <View style={[styles.corner, { bottom: inset, right: inset }]}>
          <Apple size={iconSize} color="#22C55E" strokeWidth={2.5} />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  lineH: {
    position: 'absolute',
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },
  lineV: {
    position: 'absolute',
    width: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
  },
  corner: {
    position: 'absolute',
  },
});
