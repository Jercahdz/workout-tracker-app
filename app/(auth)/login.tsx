import { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import i18n from "../../lib/i18n";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { authApi } from "../../lib/api/auth";
import { useAuthStore } from "../../store/authStore";
import { AlertModal } from "../../components/ui/AlertModal";

const loginSchema = z.object({
  email: z.string().email(i18n.t("auth.invalidEmail")),
  password: z.string().min(8, i18n.t("auth.passwordMinLength")),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const tokens = await authApi.login(data.email, data.password);
      await setTokens(tokens.accessToken, tokens.refreshToken);
      const user = await authApi.getMe();
      setUser(user);
    } catch {
      setAlertMessage(i18n.t("auth.invalidCredentials"));
      setAlertVisible(true);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t("auth.welcomeBack")}</Text>
        <Text style={styles.subtitle}>{i18n.t("auth.loginSubtitle")}</Text>
      </View>

      <Controller
        control={control}
        name="email"
        defaultValue=""
        render={({ field: { onChange, value } }) => (
          <Input
            label={i18n.t("auth.email")}
            placeholder={i18n.t("auth.emailPlaceholder")}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={onChange}
            value={value}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        defaultValue=""
        render={({ field: { onChange, value } }) => (
          <Input
            label={i18n.t("auth.password")}
            placeholder="••••••••"
            isPassword
            onChangeText={onChange}
            value={value}
            error={errors.password?.message}
          />
        )}
      />

      <Button
        title={i18n.t("auth.login")}
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>{i18n.t("auth.noAccount")} </Text>
        <Text
          style={styles.footerLink}
          onPress={() => router.push("/(auth)/register")}
        >
          {i18n.t("auth.signUp")}
        </Text>
      </View>
      <AlertModal
        visible={alertVisible}
        title={i18n.t("auth.loginFailed")}
        message={alertMessage}
        type="error"
        onClose={() => setAlertVisible(false)}
        cancelText={i18n.t("auth.tryAgain")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    color: "#00FF87",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#888888",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#888888",
  },
  footerLink: {
    color: "#00FF87",
    fontWeight: "600",
  },
});
