import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../lib/api";
import { useAuthStore } from "../../store";
import { colors, typography, spacing, radius } from "../../lib/theme";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD format
  const setAuth = useAuthStore((s) => s.setAuth);

  const registerMutation = useMutation({
    mutationFn: () =>
      authApi.register({
        username,
        email,
        password,
        dateOfBirth: dob,
      }),
    onSuccess: (data: any) => {
      setAuth(data.user, data.accessToken);
      // Proceed to profile setup
      router.replace("/auth/setup");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error ?? "Registration failed";
      Alert.alert("Registration failed", msg);
    },
  });

  const handleRegister = () => {
    // Basic date formatting check
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob)) {
      Alert.alert("Invalid date", "Please use YYYY-MM-DD format (e.g. 2005-10-15)");
      return;
    }

    // Verify age (must be 16+)
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 16) {
      Alert.alert("Age Restriction", "You must be at least 16 years old to join ahoj.");
      return;
    }

    registerMutation.mutate();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join ahoj and discover people nearby</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.form}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="e.g. alex_vibe"
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="alex@example.com"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="•••••••• (Min 8 chars)"
              placeholderTextColor={colors.text.tertiary}
              secureTextEntry
              autoComplete="new-password"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={dob}
              onChangeText={setDob}
              placeholder="2005-10-15"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="numeric"
              maxLength={10}
              returnKeyType="done"
            />
            <Text style={styles.helpText}>Must be 16 or older to sign up.</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (registerMutation.isPending || !username || !email || !password || !dob) &&
                styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={
              registerMutation.isPending || !username || !email || !password || !dob
            }
            activeOpacity={0.85}
          >
            {registerMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.footer}
        >
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  scroll: { flexGrow: 1, padding: spacing.xl, justifyContent: "center" },
  back: { marginBottom: spacing.xl },
  backText: { color: colors.primary, fontSize: typography.base, fontWeight: typography.medium },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.black,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: { fontSize: typography.base, color: colors.text.secondary, marginBottom: spacing.xl },
  form: { gap: spacing.md },
  inputGroup: { gap: spacing.xs },
  label: { fontSize: typography.sm, fontWeight: typography.medium, color: colors.text.secondary },
  input: {
    backgroundColor: colors.background.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: typography.base,
    color: colors.text.primary,
  },
  helpText: { fontSize: typography.xs, color: colors.text.tertiary },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: typography.md, fontWeight: typography.bold },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: spacing.xl },
  footerText: { color: colors.text.secondary, fontSize: typography.base },
  footerLink: { color: colors.primary, fontSize: typography.base, fontWeight: typography.semibold },
});
