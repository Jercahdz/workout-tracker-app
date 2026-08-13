import { useEffect } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { statsApi } from "../../lib/api/stats";
import { workoutsApi } from "../../lib/api/workouts";
import { useStatsStore } from "../../store/statsStore";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useRouter } from "expo-router";
import { getWorkoutColor } from "../../lib/constants/muscleGroups";

const HOME_ICONS: Record<string, any> = {
  STREAK: require("../../assets/icons/app_streak.png"),
  SHIELD: require("../../assets/icons/app_shield.png"),
  TROPHY: require("../../assets/icons/app_achievement.png"),
  XP: require("../../assets/icons/app_xp.png"),
  IA: require("../../assets/icons/app_ai_powered.png"),
  WORKOUT: require("../../assets/icons/app_exercises.png"),
};

const MUSCLE_GROUP_ICONS: Record<string, any> = {
  CHEST: require("../../assets/icons/app_chest.png"),
  BACK: require("../../assets/icons/app_back.png"),
  SHOULDERS: require("../../assets/icons/app_shoulders.png"),
  ARMS: require("../../assets/icons/app_arms.png"),
  LEGS: require("../../assets/icons/app_legs.png"),
  CORE: require("../../assets/icons/app_core.png"),
  FULL_BODY: require("../../assets/icons/app_full_body.png"),
};

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
        <Text style={styles.greeting}>{i18n.t("home.goodDay")}</Text>
        <Text style={styles.subtitle}>{i18n.t("home.subtitle")}</Text>
      </View>

      <TouchableOpacity
        style={styles.aiButton}
        onPress={() => router.push("/ai-routine")}
        activeOpacity={0.7}
      >
        <View style={styles.aiButtonLeft}>
          <View style={styles.aiButtonIcon}>
            <Image
              source={HOME_ICONS.IA}
              style={{ width: 20, height: 20, resizeMode: "contain" }}
            />
          </View>
          <View>
            <Text style={styles.aiButtonTitle}>
              {i18n.t("home.generateAI")}
            </Text>
            <Text style={styles.aiButtonSubtitle}>
              {i18n.t("home.aiSubtitle")}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#0F0F0F" />
      </TouchableOpacity>

      <Card style={styles.streakCard}>
        <View style={styles.streakRow}>
          <View>
            <Text style={styles.cardLabel}>{i18n.t("home.currentStreak")}</Text>
            <View style={styles.streakValueRow}>
              <Image
                source={HOME_ICONS.STREAK}
                style={{ width: 36, height: 36, resizeMode: "contain" }}
              />
              <Text style={styles.streakValue}>
                {statsData?.currentStreak ?? 0} {i18n.t("home.days")}
              </Text>
            </View>
            <Text style={styles.streakSub}>
              {i18n.t("home.bestStreak")}: {statsData?.bestStreak ?? 0}{" "}
              {i18n.t("home.days")}
            </Text>
          </View>
          <View style={styles.shieldsContainer}>
            <Text style={styles.cardLabel}>{i18n.t("home.shields")}</Text>
            <View style={styles.shieldsValueRow}>
              <Image
                source={HOME_ICONS.SHIELD}
                style={{ width: 30, height: 30, resizeMode: "contain" }}
              />
              <Text style={styles.shieldsValue}>{statsData?.shields ?? 0}</Text>
            </View>
          </View>
        </View>
      </Card>

      <Card style={styles.levelCard}>
        <View style={styles.levelRow}>
          <View>
            <Badge
              label={statsData?.levelName ?? i18n.t("home.rookie")}
              variant="primary"
            />
            <Text style={styles.levelText}>
              {i18n.t("home.level")} {statsData?.level ?? 1}
            </Text>
          </View>
          <View style={styles.sessionsContainer}>
            <Image
              source={HOME_ICONS.TROPHY}
              style={{ width: 22, height: 22, resizeMode: "contain" }}
            />
            <Text style={styles.sessions}>
              {statsData?.totalSessions ?? 0} {i18n.t("home.sessions")}
            </Text>
          </View>
        </View>
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBar, { width: `${xpPercent}%` }]} />
        </View>
        <View style={styles.xpLabels}>
          <Text style={styles.xpText}>{statsData?.xpProgress ?? 0} XP</Text>
          <Text style={styles.xpText}>
            {statsData?.xpRequired ?? 0} {i18n.t("home.xpNeeded")}
          </Text>
        </View>
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{i18n.t("home.recentWorkouts")}</Text>
      </View>

      {workoutsData?.data?.length ? (
        workoutsData.data.map((workout: any) => {
          const color = getWorkoutColor(workout);

          return (
            <TouchableOpacity
              key={workout.id}
              activeOpacity={0.7}
              onPress={() => router.push(`/workout/${workout.id}`)}
            >
              <Card
                style={[
                  styles.workoutCard,
                  { borderLeftWidth: 4, borderLeftColor: color },
                ]}
              >
                <View style={styles.workoutRow}>
                  <View
                    style={[
                      styles.workoutIcon,
                      { backgroundColor: `${color}20` },
                    ]}
                  >
                    {(() => {
                      const muscleGroups = workout.workoutExercises
                        ?.map((we: any) => we.exercise?.muscleGroup)
                        .filter(Boolean);
                      let primaryMuscleGroup = "EXERCISES";
                      if (muscleGroups && muscleGroups.length > 0) {
                        const grouped = muscleGroups.reduce(
                          (acc: Record<string, number>, mg: string) => {
                            acc[mg] = (acc[mg] ?? 0) + 1;
                            return acc;
                          },
                          {},
                        );
                        primaryMuscleGroup = Object.keys(grouped).sort(
                          (a, b) => grouped[b] - grouped[a],
                        )[0];
                      }
                      const iconSource =
                        MUSCLE_GROUP_ICONS[primaryMuscleGroup] ??
                        HOME_ICONS.WORKOUT;
                      return (
                        <Image
                          source={iconSource}
                          style={{
                            width: 28,
                            height: 28,
                            resizeMode: "contain",
                            tintColor: color,
                          }}
                        />
                      );
                    })()}
                  </View>

                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutExercises}>
                      {workout.workoutExercises?.length ?? 0}{" "}
                      {i18n.t("home.exercises")}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#888888" />
                </View>
              </Card>
            </TouchableOpacity>
          );
        })
      ) : (
        <View style={styles.emptyContainer}>
          <Image
            source={HOME_ICONS.WORKOUT}
            style={{
              width: 40,
              height: 40,
              resizeMode: "contain",
              tintColor: "#888888",
            }}
          />
          <Text style={styles.emptyText}>{i18n.t("home.noWorkouts")}</Text>
        </View>
      )}
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
    backgroundColor: "#0F0F0F",
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
