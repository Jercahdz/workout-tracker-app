import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import i18n from "../../lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { MUSCLE_GROUP_COLORS } from "../../lib/constants/muscleGroups";

const MUSCLE_GROUP_ICONS: Record<string, any> = {
  CHEST: require("../../assets/icons/app_chest.png"),
  BACK: require("../../assets/icons/app_back.png"),
  SHOULDERS: require("../../assets/icons/app_shoulders.png"),
  ARMS: require("../../assets/icons/app_arms.png"),
  LEGS: require("../../assets/icons/app_legs.png"),
  CORE: require("../../assets/icons/app_core.png"),
  FULL_BODY: require("../../assets/icons/app_full_body.png"),
  EXERCISES: require("../../assets/icons/app_exercises.png"),
};

const EXERCISEDB_NAME_MAP: Record<string, string> = {
  "Bench Press": "barbell bench press",
  "Incline Dumbbell Press": "incline dumbbell press",
  "Pull Up": "pull-up",
  "Barbell Row": "barbell bent over row",
  "Lat Pulldown": "cable lat pulldown",
  Deadlift: "deadlift",
  Squat: "barbell squat",
  "Overhead Press": "barbell overhead press",
  "Romanian Deadlift": "romanian deadlift",
  "Leg Press": "leg press",
  "Dumbbell Curl": "dumbbell curl",
  "Tricep Pushdown": "cable triceps pushdown",
  Plank: "plank",
  Dips: "dips",
  Lunges: "lunges",
  "Hip Thrust": "barbell hip thrust",
  "Skull Crusher": "ez barbell skull crusher",
  "Hammer Curl": "hammer curls",
  "Lateral Raise": "lateral raises",
};

interface ExerciseDBData {
  instructions: string[];
  target: string;
  secondaryMuscles: string[];
  difficulty?: string;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: i18n.t("exerciseDetail.difficulty.beginner"),
  intermediate: i18n.t("exerciseDetail.difficulty.intermediate"),
  advanced: i18n.t("exerciseDetail.difficulty.advanced"),
};

const MUSCLE_GROUP_TRANSLATIONS: Record<string, string> = {
  CHEST: i18n.t("exercises.chest"),
  BACK: i18n.t("exercises.back"),
  SHOULDERS: i18n.t("exercises.shoulders"),
  ARMS: i18n.t("exercises.arms"),
  LEGS: i18n.t("exercises.legs"),
  CORE: i18n.t("exercises.core"),
  FULL_BODY: i18n.t("exercises.fullBody"),
};

const MUSCLE_TRANSLATIONS: Record<string, string> = {
  delts: i18n.t("exerciseDetail.muscles.delts"),
  triceps: i18n.t("exerciseDetail.muscles.triceps"),
  "upper chest": i18n.t("exerciseDetail.muscles.upper chest"),
  pectorals: i18n.t("exerciseDetail.muscles.pectorals"),
  biceps: i18n.t("exerciseDetail.muscles.biceps"),
  lats: i18n.t("exerciseDetail.muscles.lats"),
  traps: i18n.t("exerciseDetail.muscles.traps"),
  quads: i18n.t("exerciseDetail.muscles.quads"),
  hamstrings: i18n.t("exerciseDetail.muscles.hamstrings"),
  glutes: i18n.t("exerciseDetail.muscles.glutes"),
  calves: i18n.t("exerciseDetail.muscles.calves"),
  abs: i18n.t("exerciseDetail.muscles.abs"),
  obliques: i18n.t("exerciseDetail.muscles.obliques"),
  forearms: i18n.t("exerciseDetail.muscles.forearms"),
};

const EQUIPMENT_TRANSLATIONS: Record<string, string> = {
  Barbell: i18n.t("exercises.equipment.barbell"),
  Dumbbells: i18n.t("exercises.equipment.dumbbells"),
  Dumbbell: i18n.t("exercises.equipment.dumbbell"),
  "Cable Machine": i18n.t("exercises.equipment.cableMachine"),
  "Pull-up Bar": i18n.t("exercises.equipment.pullUpBar"),
  Machine: i18n.t("exercises.equipment.machine"),
  Plates: i18n.t("exercises.equipment.plates"),
  "Parallel Bars": i18n.t("exercises.equipment.parallelBars"),
  "Leg Press Machine": i18n.t("exercises.equipment.legPressMachine"),
  Kettlebell: i18n.t("exercises.equipment.kettlebell"),
  "Ab Wheel": i18n.t("exercises.equipment.abWheel"),
  Box: i18n.t("exercises.equipment.box"),
  "Battle Ropes": i18n.t("exercises.equipment.battleRopes"),
  "Medicine Ball": i18n.t("exercises.equipment.medicineBall"),
  Sled: i18n.t("exercises.equipment.sled"),
  Rope: i18n.t("exercises.equipment.rope"),
  Prowler: i18n.t("exercises.equipment.prowler"),
  Sandbag: i18n.t("exercises.equipment.sandbag"),
  Bodyweight: i18n.t("exercises.equipment.bodyweight"),
  "T-Bar": i18n.t("exercises.equipment.tBar"),
  "EZ Bar": i18n.t("exercises.equipment.ezBar"),
};

export default function ExerciseDetailScreen() {
  const { id, name, muscleGroup, equipment, description } =
    useLocalSearchParams<{
      id: string;
      name: string;
      muscleGroup: string;
      equipment: string;
      description: string;
    }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [exerciseDbId, setExerciseDbId] = useState<string | null>(null);
  const [exerciseData, setExerciseData] = useState<ExerciseDBData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchExerciseData = async () => {
      setDataLoading(true);
      try {
        const searchName = EXERCISEDB_NAME_MAP[name] ?? name.toLowerCase();
        const response = await fetch(
          `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(searchName)}?limit=1`,
          {
            headers: {
              "x-rapidapi-host": "exercisedb.p.rapidapi.com",
              "x-rapidapi-key":
                (process as any).env.EXPO_PUBLIC_EXERCISEDB_KEY ?? "",
            },
          },
        );
        const data = await response.json();
        if (data && data.length > 0) {
          setExerciseData(data[0]);
          setExerciseDbId(data[0].id);
        }
      } catch {
        // fallback
      } finally {
        setDataLoading(false);
      }
    };

    fetchExerciseData();
  }, [name]);

  const color = MUSCLE_GROUP_COLORS[muscleGroup] ?? "#888888";

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card
          style={[
            styles.heroCard,
            {
              borderColor: `${color}40`,
              borderLeftWidth: 4,
              borderLeftColor: color,
            },
          ]}
        >
          {exerciseDbId ? (
            <Image
              source={{
                uri: `https://exercisedb.p.rapidapi.com/image?exerciseId=${exerciseDbId}&resolution=180&rapidapi-key=${(process as any).env.EXPO_PUBLIC_EXERCISEDB_KEY}`,
              }}
              style={styles.gif}
              resizeMode="contain"
            />
          ) : dataLoading ? (
            <View
              style={[
                styles.heroIcon,
                { backgroundColor: `${color}15`, width: 100, height: 100 },
              ]}
            >
              <ActivityIndicator color={color} size="large" />
            </View>
          ) : MUSCLE_GROUP_ICONS[muscleGroup] ? (
            <Image
              source={MUSCLE_GROUP_ICONS[muscleGroup]}
              style={[
                styles.exerciseIconImage,
                {
                  tintColor: color,
                },
              ]}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.heroIcon, { backgroundColor: `${color}15` }]}>
              <Ionicons name="barbell-outline" size={56} color={color} />
            </View>
          )}
          <Text style={styles.heroName}>{name}</Text>
          <View style={styles.badgeRow}>
            <Badge
              label={MUSCLE_GROUP_TRANSLATIONS[muscleGroup] ?? muscleGroup}
              variant="primary"
            />
            {equipment && (
              <Badge
                label={EQUIPMENT_TRANSLATIONS[equipment] ?? equipment}
                variant="muted"
              />
            )}
            {exerciseData?.difficulty && (
              <Badge
                label={
                  DIFFICULTY_LABELS[exerciseData.difficulty.toLowerCase()] ??
                  exerciseData.difficulty
                }
                variant="warning"
              />
            )}
          </View>
        </Card>

        {description && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>
              {i18n.t("exerciseDetail.about")}
            </Text>
            <Text style={styles.description}>{description}</Text>
          </Card>
        )}

        {exerciseData?.secondaryMuscles &&
          exerciseData.secondaryMuscles.length > 0 && (
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>
                {i18n.t("exerciseDetail.musclesWorked")}
              </Text>
              <View style={styles.muscleRow}>
                <View style={styles.muscleItem}>
                  <Text style={styles.muscleLabel}>
                    {i18n.t("exerciseDetail.primary")}
                  </Text>
                  <Text style={styles.muscleValue}>
                    {MUSCLE_TRANSLATIONS[exerciseData.target] ??
                      exerciseData.target}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.muscleItem}>
                  <Text style={styles.muscleLabel}>
                    {i18n.t("exerciseDetail.secondary")}
                  </Text>
                  <Text style={styles.muscleValue}>
                    {exerciseData.secondaryMuscles
                      .map(
                        (muscle) =>
                          MUSCLE_TRANSLATIONS[muscle.toLowerCase()] ?? muscle,
                      )
                      .join(", ")}
                  </Text>
                </View>
              </View>
            </Card>
          )}

        {dataLoading ? (
          <Card style={styles.card}>
            <ActivityIndicator color= "color" size="small" />
            <Text style={styles.loadingText}>
              {i18n.t("exerciseDetail.loadingInstructions")}
            </Text>
          </Card>
        ) : exerciseData?.instructions &&
          exerciseData.instructions.length > 0 ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>
              {i18n.t("exerciseDetail.howToPerform")}
            </Text>
            {exerciseData.instructions.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>
              {i18n.t("exerciseDetail.tips")}
            </Text>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={18} color="#00FF87" />
              <Text style={styles.tipText}>
                {i18n.t("exerciseDetail.tipForm")}
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={18} color="#00FF87" />
              <Text style={styles.tipText}>
                {i18n.t("exerciseDetail.tipControl")}
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={18} color="#00FF87" />
              <Text style={styles.tipText}>
                {i18n.t("exerciseDetail.tipBreathe")}
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={18} color="#00FF87" />
              <Text style={styles.tipText}>
                {i18n.t("exerciseDetail.tipWarmup")}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F", paddingBottom: 28 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  title: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 12,
  },
  content: { padding: 20, gap: 16 },
  exerciseIconImage: {
    width: 120,
    height: 120,
  },
  gif: { width: "100%", height: 250, borderRadius: 16 },
  heroCard: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
    borderWidth: 1,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  heroName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: { gap: 12 },
  cardTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  description: { color: "#888888", fontSize: 15, lineHeight: 22 },
  muscleRow: { flexDirection: "row", gap: 16 },
  muscleItem: { flex: 1, gap: 4 },
  muscleLabel: {
    color: "#888888",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  muscleValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  divider: { width: 1, backgroundColor: "#2A2A2A" },
  loadingText: { color: "#888888", fontSize: 14, textAlign: "center" },
  stepRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,255,135,0.1)",
    borderWidth: 1,
    borderColor: "#00FF87",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  stepNumberText: { color: "#00FF87", fontSize: 13, fontWeight: "bold" },
  stepText: { color: "#CCCCCC", fontSize: 14, lineHeight: 20, flex: 1 },
  tipRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  tipText: { color: "#CCCCCC", fontSize: 14, lineHeight: 20, flex: 1 },
});
