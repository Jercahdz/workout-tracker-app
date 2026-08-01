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
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

const MUSCLE_GROUP_COLORS: Record<string, string> = {
  CHEST: "#EF4444",
  BACK: "#3B82F6",
  SHOULDERS: "#8B5CF6",
  ARMS: "#F59E0B",
  LEGS: "#10B981",
  CORE: "#F97316",
  FULL_BODY: "#00FF87",
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
        <Card style={[styles.heroCard, { borderColor: `${color}40` }]}>
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
          ) : (
            <View style={[styles.heroIcon, { backgroundColor: `${color}15` }]}>
              <Ionicons name="barbell-outline" size={56} color={color} />
            </View>
          )}
          <Text style={styles.heroName}>{name}</Text>
          <View style={styles.badgeRow}>
            <Badge label={muscleGroup.replace("_", " ")} variant="primary" />
            {equipment && <Badge label={equipment} variant="muted" />}
            {exerciseData?.difficulty && (
              <Badge label={exerciseData.difficulty} variant="warning" />
            )}
          </View>
        </Card>

        {description && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.description}>{description}</Text>
          </Card>
        )}

        {exerciseData?.secondaryMuscles &&
          exerciseData.secondaryMuscles.length > 0 && (
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Muscles Worked</Text>
              <View style={styles.muscleRow}>
                <View style={styles.muscleItem}>
                  <Text style={styles.muscleLabel}>Primary</Text>
                  <Text style={styles.muscleValue}>{exerciseData.target}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.muscleItem}>
                  <Text style={styles.muscleLabel}>Secondary</Text>
                  <Text style={styles.muscleValue}>
                    {exerciseData.secondaryMuscles.join(", ")}
                  </Text>
                </View>
              </View>
            </Card>
          )}

        {dataLoading ? (
          <Card style={styles.card}>
            <ActivityIndicator color="#00FF87" size="small" />
            <Text style={styles.loadingText}>Loading instructions...</Text>
          </Card>
        ) : exerciseData?.instructions &&
          exerciseData.instructions.length > 0 ? (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>How To Perform</Text>
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
            <Text style={styles.cardTitle}>Tips</Text>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={18} color="#00FF87" />
              <Text style={styles.tipText}>
                Maintain proper form throughout the movement.
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={18} color="#00FF87" />
              <Text style={styles.tipText}>
                Control the weight on both the concentric and eccentric phases.
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={18} color="#00FF87" />
              <Text style={styles.tipText}>
                Breathe out on exertion and in on the return.
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={18} color="#00FF87" />
              <Text style={styles.tipText}>
                Warm up properly before adding heavy loads.
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
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
  title: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 12,
  },
  content: { padding: 20, gap: 16 },
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
