import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { statsApi } from "../../lib/api/stats";
import { workoutsApi } from "../../lib/api/workouts";
import { useStatsStore } from "../../store/statsStore";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { setStats } = useStatsStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: statsApi.get,
  });

  const { data: workoutsData, isLoading: workoutsLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => workoutsApi.getAll(1, 3),
  });

  useEffect(() => {
    if (statsData) setStats(statsData);
  }, [statsData]);

  if (statsLoading || workoutsLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#00FF87" size="large" />
      </View>
    );
  }

  const xpPercent = statsData?.xpRequired
    ? Math.min(100, ((statsData.xpProgress ?? 0) / statsData.xpRequired) * 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Good day</Text>
        <Text style={styles.subtitle}>Keep pushing your limits</Text>
      </View>

      <TouchableOpacity
        style={styles.aiButton}
        onPress={() => router.push("/ai-routine")}
        activeOpacity={0.7}
      >
        <View style={styles.aiButtonLeft}>
          <View style={styles.aiButtonIcon}>
            <Ionicons name="flash" size={20} color="#0F0F0F" />
          </View>
          <View>
            <Text style={styles.aiButtonTitle}>Generate AI Routine</Text>
            <Text style={styles.aiButtonSubtitle}>
              Get a personalized workout plan
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#0F0F0F" />
      </TouchableOpacity>

      <Card style={styles.streakCard}>
        <View style={styles.streakRow}>
          <View>
            <Text style={styles.cardLabel}>Current Streak</Text>
            <View style={styles.streakValueRow}>
              <Ionicons name="flame" size={36} color="#FF6B35" />
              <Text style={styles.streakValue}>
                {statsData?.currentStreak ?? 0} days
              </Text>
            </View>
            <Text style={styles.streakSub}>
              Best: {statsData?.bestStreak ?? 0} days
            </Text>
          </View>
          <View style={styles.shieldsContainer}>
            <Text style={styles.cardLabel}>Shields</Text>
            <View style={styles.shieldsValueRow}>
              <Ionicons name="shield" size={28} color="#00FF87" />
              <Text style={styles.shieldsValue}>{statsData?.shields ?? 0}</Text>
            </View>
          </View>
        </View>
      </Card>

      <Card style={styles.levelCard}>
        <View style={styles.levelRow}>
          <View>
            <Badge label={statsData?.levelName ?? "Rookie"} variant="primary" />
            <Text style={styles.levelText}>Level {statsData?.level ?? 1}</Text>
          </View>
          <View style={styles.sessionsContainer}>
            <Ionicons name="trophy-outline" size={20} color="#888888" />
            <Text style={styles.sessions}>
              {statsData?.totalSessions ?? 0} sessions
            </Text>
          </View>
        </View>
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBar, { width: `${xpPercent}%` }]} />
        </View>
        <View style={styles.xpLabels}>
          <Text style={styles.xpText}>{statsData?.xpProgress ?? 0} XP</Text>
          <Text style={styles.xpText}>
            {statsData?.xpRequired ?? 0} XP needed
          </Text>
        </View>
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
      </View>

      {workoutsData?.data?.map((workout: any) => (
        <TouchableOpacity
          key={workout.id}
          activeOpacity={0.7}
          onPress={() => router.push(`/workout/${workout.id}`)}
        >
          <Card style={styles.workoutCard}>
            <View style={styles.workoutRow}>
              <View style={styles.workoutIcon}>
                <Ionicons name="barbell-outline" size={20} color="#00FF87" />
              </View>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutExercises}>
                  {workout.workoutExercises?.length ?? 0} exercises
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#888888" />
            </View>
          </Card>
        </TouchableOpacity>
      ))}

      {workoutsData?.data?.map((workout: any) => (
        <Card key={workout.id} style={styles.workoutCard}>
          <View style={styles.workoutRow}>
            <View style={styles.workoutIcon}>
              <Ionicons name="barbell-outline" size={20} color="#00FF87" />
            </View>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutExercises}>
                {workout.workoutExercises?.length ?? 0} exercises
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888888" />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  content: {
    padding: 20,
  },
  loading: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#888888",
    fontSize: 16,
    marginTop: 4,
  },
  streakCard: {
    marginBottom: 16,
  },
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLabel: {
    color: "#888888",
    fontSize: 13,
    marginBottom: 8,
  },
  streakValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  streakValue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  streakSub: {
    color: "#888888",
    fontSize: 13,
    marginTop: 6,
  },
  shieldsContainer: {
    alignItems: "center",
  },
  shieldsValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  shieldsValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  aiButton: {
    backgroundColor: "#00FF87",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  aiButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  aiButtonIcon: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  aiButtonTitle: {
    color: "#0F0F0F",
    fontSize: 15,
    fontWeight: "bold",
  },
  aiButtonSubtitle: {
    color: "rgba(0,0,0,0.6)",
    fontSize: 12,
    marginTop: 2,
  },
  levelCard: {
    marginBottom: 24,
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  levelText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  sessionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sessions: {
    color: "#888888",
    fontSize: 14,
  },
  xpBarContainer: {
    height: 8,
    backgroundColor: "#2A2A2A",
    borderRadius: 4,
    overflow: "hidden",
  },
  xpBar: {
    height: "100%",
    backgroundColor: "#00FF87",
    borderRadius: 4,
  },
  xpLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  xpText: {
    color: "#888888",
    fontSize: 12,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  workoutCard: {
    marginBottom: 12,
  },
  workoutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(0,255,135,0.1)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  workoutExercises: {
    color: "#888888",
    fontSize: 14,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 12,
  },
  emptyText: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
  },
});
