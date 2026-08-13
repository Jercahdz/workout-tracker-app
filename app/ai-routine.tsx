import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import i18n from "../lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { aiApi } from "../lib/api/ai";
import { workoutsApi } from "../lib/api/workouts";
import { exercisesApi } from "../lib/api/exercises";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { AlertModal } from "../components/ui/AlertModal";
import {
  MUSCLE_GROUP_COLORS,
} from "../lib/constants/muscleGroups";

const AI_ICONS: Record<string, any> = {
  UNSTOPPABLE: require("../assets/icons/app_unstoppable.png"),
};

interface AIExercise {
  name: string;
  sets: number;
  reps: number;
  restSeconds: number;
  notes?: string;
}

interface AIDay {
  name: string;
  muscleGroups: string[];
  exercises: AIExercise[];
  estimatedDuration: number;
}

interface AIRoutine {
  summary: string;
  days: AIDay[];
}

const getDayColor = (muscleGroups: string[]): string => {
  if (!muscleGroups || muscleGroups.length === 0) return "#00FF87";
  const first = muscleGroups[0].toUpperCase();
  return MUSCLE_GROUP_COLORS[first] ?? "#00FF87";
};

export default function AiRoutineScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [routine, setRoutine] = useState<AIRoutine | null>(null);
  const [rawRoutine, setRawRoutine] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [creatingWorkouts, setCreatingWorkouts] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "warning" | "success" | "info",
  });

  const generateRoutine = async () => {
    setIsLoading(true);
    setRoutine(null);
    setRawRoutine(null);
    try {
      const response = await aiApi.generateRoutine();
      if (response.routine) {
        setRoutine(response.routine);
      } else {
        setRawRoutine(response.raw);
      }
    } catch {
      setAlertConfig({
        title: i18n.t("common.error"),
        message: i18n.t("ai.errorGenerate"),
        type: "error",
      });
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkouts = async () => {
    if (!routine) return;
    setCreatingWorkouts(true);

    try {
      const exercisesResponse = await exercisesApi.getAll(1, 100);
      const catalogExercises = exercisesResponse?.data ?? [];

      let created = 0;
      let skipped = 0;

      for (const day of routine.days) {
        const matchedExercises = day.exercises
          .map((aiEx) => {
            const match = catalogExercises.find(
              (ce: any) =>
                ce.name.toLowerCase().includes(aiEx.name.toLowerCase()) ||
                aiEx.name.toLowerCase().includes(ce.name.toLowerCase()),
            );
            if (match) {
              return {
                exerciseId: match.id,
                sets: aiEx.sets,
                reps: aiEx.reps,
              };
            }
            return null;
          })
          .filter(Boolean);

        if (matchedExercises.length > 0) {
          await workoutsApi.create({
            name: day.name,
            exercises: matchedExercises as any,
          });
          created++;
        } else {
          skipped++;
        }
      }

      queryClient.invalidateQueries({ queryKey: ["workouts"] });

      const message = i18n.t("ai.workoutsCreatedMsg", {
        count: created,
      });

      const skippedMessage =
        skipped > 0
          ? ` ${i18n.t("ai.workoutsSkippedMsg", { count: skipped })}`
          : "";

      setAlertConfig({
        title: i18n.t("ai.workoutsCreated"),
        message: message + skippedMessage,
        type: "success",
      });
    } catch {
      setAlertConfig({
        title: i18n.t("common.error"),
        message: i18n.t("ai.errorCreate"),
        type: "error",
      });
      setAlertVisible(true);
    } finally {
      setCreatingWorkouts(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>{i18n.t("ai.title")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!routine && !rawRoutine && !isLoading && (
          <Card style={styles.introCard}>
            <View style={styles.introIconContainer}>
              <Image
                source={AI_ICONS.UNSTOPPABLE}
                style={[
                  styles.introIcon,
                  {
                    width: 40,
                    height: 40,
                  },
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.introTitle}>{i18n.t("ai.generate")}</Text>
            <Text style={styles.introText}>
              {i18n.t("ai.generateSubtitle")}
            </Text>
            <Text style={styles.introNote}>{i18n.t("ai.generateNote")}</Text>
          </Card>
        )}

        {isLoading && (
          <Card style={styles.loadingCard}>
            <ActivityIndicator color="#00FF87" size="large" />
            <Text style={styles.loadingTitle}>{i18n.t("ai.generating")}</Text>
            <Text style={styles.loadingText}>
              {i18n.t("ai.generatingSubtitle")}
            </Text>
          </Card>
        )}

        {routine && !isLoading && (
          <>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#00FF87" />
                <Text style={styles.summaryTitle}>
                  {i18n.t("ai.yourRoutine")}
                </Text>
              </View>
              <Text style={styles.summaryText}>{routine.summary}</Text>
            </Card>

            {routine.days.map((day, index) => {
              const color = getDayColor(day.muscleGroups);
              return (
                <Card
                  key={index}
                  style={[
                    styles.dayCard,
                    { borderLeftWidth: 4, borderLeftColor: color },
                  ]}
                >
                  <View style={styles.dayHeader}>
                    <View
                      style={[
                        styles.dayNumberBadge,
                        { backgroundColor: `${color}20`, borderColor: color },
                      ]}
                    >
                      <Text style={[styles.dayNumber, { color }]}>
                        {i18n.t("ai.day")} {index + 1}
                      </Text>
                    </View>
                    <View style={styles.dayTitleContainer}>
                      <Text style={styles.dayName}>{day.name}</Text>
                      <Text style={styles.dayDuration}>
                        ~{day.estimatedDuration} {i18n.t("ai.min")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.muscleGroupsRow}>
                    {day.muscleGroups.slice(0, 3).map((mg, i) => (
                      <Badge key={i} label={mg} variant="muted" />
                    ))}
                  </View>

                  <View style={styles.exercisesList}>
                    {day.exercises.map((exercise, i) => (
                      <View key={i} style={styles.exerciseItem}>
                        <View style={styles.exerciseItemLeft}>
                          <View
                            style={[
                              styles.exerciseDot,
                              { backgroundColor: color },
                            ]}
                          />
                          <Text style={styles.exerciseItemName}>
                            {exercise.name}
                          </Text>
                        </View>
                        <Text style={styles.exerciseItemMeta}>
                          {exercise.sets}x{exercise.reps}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Card>
              );
            })}

            <Button
              title={
                creatingWorkouts
                  ? i18n.t("ai.creating")
                  : i18n.t("ai.saveAsWorkouts")
              }
              onPress={createWorkouts}
              loading={creatingWorkouts}
              variant="primary"
            />
          </>
        )}

        {rawRoutine && !isLoading && (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{i18n.t("ai.yourRoutine")}</Text>
            <Text style={styles.summaryText}>{rawRoutine}</Text>
          </Card>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={
              routine || rawRoutine
                ? i18n.t("ai.regenerate")
                : i18n.t("ai.generateBtn")
            }
            onPress={generateRoutine}
            loading={isLoading}
            variant={routine || rawRoutine ? "outline" : "primary"}
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
  content: { padding: 20, gap: 16, paddingBottom: 40 },
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
  introIcon: {
    width: 40,
    height: 40,
  },
  loadingCard: { alignItems: "center", paddingVertical: 40, gap: 16 },
  loadingTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  loadingText: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  summaryCard: { gap: 12 },
  summaryHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  summaryText: { color: "#888888", fontSize: 14, lineHeight: 22 },
  dayCard: { gap: 12 },
  dayHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  dayNumberBadge: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(0,255,135,0.1)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00FF87",
  },
  dayNumber: { color: "#00FF87", fontSize: 12, fontWeight: "bold" },
  dayTitleContainer: { flex: 1 },
  dayName: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  dayDuration: { color: "#888888", fontSize: 13, marginTop: 2 },
  muscleGroupsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  exercisesList: { gap: 8 },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exerciseItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  exerciseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00FF87",
  },
  exerciseItemName: { color: "#CCCCCC", fontSize: 14, flex: 1 },
  exerciseItemMeta: { color: "#888888", fontSize: 13, fontWeight: "600" },
  buttonContainer: { marginTop: 8, paddingBottom: 22 },
});
