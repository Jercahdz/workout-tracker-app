import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Clipboard,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { aiApi } from "../lib/api/ai";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { AlertModal } from "../components/ui/AlertModal";

export default function AiRoutineScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [routine, setRoutine] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "warning" | "success" | "info",
  });

  const generateRoutine = async () => {
    setIsLoading(true);
    setRoutine(null);
    try {
      const response = await aiApi.generateRoutine();
      setRoutine(response.routine);
    } catch {
      setAlertConfig({
        title: "Error",
        message:
          "Could not generate routine. Make sure you have a fitness profile set up.",
        type: "error",
      });
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (routine) {
      Clipboard.setString(routine);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const markdownStyles = {
    body: { color: "#CCCCCC", fontSize: 14, lineHeight: 22 },
    heading1: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "bold" as const,
      marginBottom: 8,
      marginTop: 16,
    },
    heading2: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "bold" as const,
      marginBottom: 6,
      marginTop: 14,
    },
    heading3: {
      color: "#00FF87",
      fontSize: 16,
      fontWeight: "bold" as const,
      marginBottom: 4,
      marginTop: 12,
    },
    strong: { color: "#FFFFFF", fontWeight: "bold" as const },
    bullet_list: { marginBottom: 8 },
    ordered_list: { marginBottom: 8 },
    list_item: { color: "#CCCCCC", fontSize: 14, lineHeight: 22 },
    hr: { backgroundColor: "#2A2A2A", height: 1, marginVertical: 12 },
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>AI Routine</Text>
        {routine ? (
          <TouchableOpacity onPress={handleCopy} activeOpacity={0.7}>
            <Ionicons
              name={copied ? "checkmark" : "copy-outline"}
              size={24}
              color={copied ? "#00FF87" : "#888888"}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!routine && !isLoading && (
          <Card style={styles.introCard}>
            <View style={styles.introIconContainer}>
              <Ionicons name="flash" size={40} color="#00FF87" />
            </View>
            <Text style={styles.introTitle}>Generate Your Routine</Text>
            <Text style={styles.introText}>
              Our AI will create a personalized 5-day workout plan based on your
              fitness profile, goals and level.
            </Text>
            <Text style={styles.introNote}>
              Make sure your profile is up to date for the best results.
            </Text>
          </Card>
        )}

        {isLoading && (
          <Card style={styles.loadingCard}>
            <ActivityIndicator color="#00FF87" size="large" />
            <Text style={styles.loadingTitle}>Generating your routine...</Text>
            <Text style={styles.loadingText}>
              This may take a few seconds. Our AI is analyzing your profile.
            </Text>
          </Card>
        )}

        {routine && !isLoading && (
          <Card style={styles.routineCard}>
            <View style={styles.routineHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#00FF87" />
              <Text style={styles.routineTitle}>Your Personalized Routine</Text>
            </View>
            <Markdown style={markdownStyles}>{routine}</Markdown>
          </Card>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={routine ? "Regenerate Routine" : "Generate Routine"}
            onPress={generateRoutine}
            loading={isLoading}
            variant={routine ? "outline" : "primary"}
          />
        </View>
      </ScrollView>

      <AlertModal
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  content: { padding: 20, gap: 16 },
  introCard: { alignItems: "center", paddingVertical: 32, gap: 12 },
  introIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(0,255,135,0.1)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  introTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  introText: {
    color: "#888888",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  introNote: {
    color: "#00FF87",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  loadingCard: { alignItems: "center", paddingVertical: 40, gap: 16 },
  loadingTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  loadingText: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  routineCard: { gap: 16 },
  routineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  routineTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  buttonContainer: { marginTop: 8 },
});
