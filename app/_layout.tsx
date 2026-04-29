import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useCallback } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppProvider, useApp } from "@/providers/AppProvider";
import { useColors } from "@/hooks/useColors";
import { Colors } from "@/constants/colors";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const PIN_KEY = "user_pin";
const DIGITS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

function PinSetupModal() {
  const { showPinSetup, setPinSetupComplete } = useApp();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [error, setError] = useState("");

  const current = step === "enter" ? pin : confirmPin;

  const reset = useCallback(() => {
    setPin("");
    setConfirmPin("");
    setStep("enter");
    setError("");
  }, []);

  const handleSkip = useCallback(() => {
    reset();
    setPinSetupComplete();
  }, [reset, setPinSetupComplete]);

  const handleDigit = useCallback((digit: string) => {
    const cur = step === "enter" ? pin : confirmPin;
    if (cur.length >= 4) return;
    const next = cur + digit;
    if (step === "enter") {
      setPin(next);
      if (next.length === 4) setStep("confirm");
    } else {
      setConfirmPin(next);
      if (next.length === 4) {
        if (next === pin) {
          void AsyncStorage.setItem(PIN_KEY, next).then(() => {
            reset();
            setPinSetupComplete();
          });
        } else {
          setError("PINs do not match. Try again.");
          setTimeout(() => {
            setError("");
            setPin("");
            setConfirmPin("");
            setStep("enter");
          }, 1400);
        }
      }
    }
  }, [step, pin, confirmPin, reset, setPinSetupComplete]);

  const handleBackspace = useCallback(() => {
    if (step === "enter") setPin(p => p.slice(0, -1));
    else setConfirmPin(p => p.slice(0, -1));
  }, [step]);

  return (
    <Modal visible={showPinSetup} animationType="fade" transparent={false} onRequestClose={handleSkip}>
      <View style={pinStyles.container}>
        <Text style={pinStyles.title}>Set Up PIN</Text>
        <Text style={pinStyles.subtitle}>
          {step === "enter" ? "Enter a 4-digit PIN for quick access" : "Confirm your PIN"}
        </Text>
        <View style={pinStyles.dotsRow}>
          {[0,1,2,3].map(i => (
            <View key={i} style={[pinStyles.dot, current.length > i && pinStyles.dotFilled]} />
          ))}
        </View>
        {error ? <Text style={pinStyles.error}>{error}</Text> : <View style={pinStyles.errorPlaceholder} />}
        <View style={pinStyles.numpad}>
          {DIGITS.map((key, i) => (
            <TouchableOpacity
              key={i}
              style={[pinStyles.numKey, key === "" && pinStyles.numKeyEmpty]}
              onPress={() => {
                if (key === "⌫") handleBackspace();
                else if (key !== "") handleDigit(key);
              }}
              disabled={key === ""}
              activeOpacity={0.6}
            >
              <Text style={[pinStyles.numKeyText, key === "⌫" && pinStyles.backspaceText]}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={handleSkip} style={pinStyles.skipBtn} activeOpacity={0.6}>
          <Text style={pinStyles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function RootLayoutNav() {
  const colors = useColors();
  return (
    <>
      <PinSetupModal />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "default",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="pin-entry" options={{ headerShown: false }} />
        <Stack.Screen name="quiz" options={{ headerShown: false }} />
        <Stack.Screen name="disclaimer" options={{ headerShown: false }} />
        <Stack.Screen name="paywall" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
        <Stack.Screen name="journal" options={{ title: "Journal" }} />
        <Stack.Screen name="community" options={{ title: "Community" }} />
        <Stack.Screen name="appearance" options={{ title: "Appearance" }} />
        <Stack.Screen name="language" options={{ title: "Language" }} />
        <Stack.Screen name="help-centre" options={{ title: "Help Centre" }} />
        <Stack.Screen name="privacy-policy" options={{ title: "Privacy Policy" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <AppProvider>
          <RootLayoutNav />
        </AppProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const pinStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  title: { fontSize: 26, fontWeight: "800", color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: "center", marginBottom: 40 },
  dotsRow: { flexDirection: "row", gap: 20, marginBottom: 16 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: Colors.border, backgroundColor: "transparent" },
  dotFilled: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  error: { fontSize: 13, color: Colors.error, textAlign: "center", height: 20, marginBottom: 8 },
  errorPlaceholder: { height: 28 },
  numpad: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", width: 280, gap: 12, marginBottom: 40 },
  numKey: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" },
  numKeyEmpty: { backgroundColor: "transparent" },
  numKeyText: { fontSize: 26, fontWeight: "500", color: Colors.text },
  backspaceText: { fontSize: 22 },
  skipBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  skipText: { fontSize: 15, color: Colors.textMuted },
});
