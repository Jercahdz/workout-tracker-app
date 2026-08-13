import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
} from "react-native";
import i18n from "../../lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { workoutsApi } from "../../lib/api/workouts";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AlertModal } from "../../components/ui/AlertModal";
import { getWorkoutColor } from "../../lib/constants/muscleGroups";

const WORKOUT_ICONS: Record<string, any> = {
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

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "warning" | "success" | "info",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => workoutsApi.getAll(1, 20),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      workoutsApi.create({
        name,
        exercises: [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      setModalVisible(false);
      setWorkoutName("");
    },
    onError: () => {
      setAlertConfig({
        title: i18n.t("common.error"),
        message: i18n.t("workouts.errorCreate"),
        type: "error",
      });
      setAlertVisible(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await workoutsApi.delete(id);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
    onError: (error) => {
      setAlertConfig({
        title: i18n.t("common.error"),
        message: i18n.t("workouts.errorDelete"),
        type: "error",
      });
      setAlertVisible(true);
    },
  });

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleCreate = () => {
    if (!workoutName.trim()) {
      setAlertConfig({
        title: i18n.t("workouts.missingName"),
        message: i18n.t("workouts.missingNameMsg"),
        type: "warning",
      });
      setAlertVisible(true);
      return;
    }
    createMutation.mutate(workoutName.trim());
  };

  const groupWorkoutsByWeek = (workouts: any[]) => {
    const groups: { label: string; data: any[] }[] = [];
    const now = new Date();

    workouts.forEach((workout) => {
      const date = new Date(workout.createdAt);
      const diffDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
      );

      let label = "";
      if (diffDays < 7) {
        label = i18n.t("workouts.thisWeek");
      } else if (diffDays < 14) {
        label = i18n.t("workouts.lastWeek");
      } else if (diffDays < 30) {
        label = i18n.t("workouts.thisMonth");
      } else {
        label = i18n.t("workouts.older");
      }

      const existing = groups.find((g) => g.label === label);
      if (existing) {
        existing.data.push(workout);
      } else {
        groups.push({ label, data: [workout] });
      }
    });

    return groups;
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#00FF87" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20 },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{i18n.t("workouts.title")}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color="#0F0F0F" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#888888" />
          <TextInput
            style={styles.searchInput}
            placeholder={i18n.t("workouts.search")}
            placeholderTextColor="#888888"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#888888" />
            </TouchableOpacity>
          )}
        </View>

        {data?.data?.length === 0 && (
          <Card>
            <View style={styles.emptyContainer}>
              <Image
                source={WORKOUT_ICONS.WORKOUT}
                style={{
                  width: 48,
                  height: 48,
                  resizeMode: "contain",
                  tintColor: "#888888",
                }}
              />
              <Text style={styles.emptyTitle}>
                {i18n.t("workouts.noWorkouts")}
              </Text>
              <Text style={styles.emptyText}>
                {i18n.t("workouts.noWorkoutsSubtitle")}
              </Text>
            </View>
          </Card>
        )}

        {(() => {
          const filtered = (data?.data ?? []).filter(
            (w: any) =>
              search.length === 0 ||
              w.name.toLowerCase().includes(search.toLowerCase()),
          );
          const groups = groupWorkoutsByWeek(filtered);

          return groups.map((group) => (
            <View key={group.label} style={styles.groupContainer}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              {group.data.map((workout: any) => {
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
                            const muscleGroups = workout.workoutExercises?.map(
                              (we: any) => we.exercise?.muscleGroup,
                            ).filter(Boolean);
                            let primaryMuscleGroup = "EXERCISES";
                            if (
                              muscleGroups &&
                              muscleGroups.length > 0
                            ) {
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
                            const iconSource = MUSCLE_GROUP_ICONS[
                              primaryMuscleGroup
                            ] ?? WORKOUT_ICONS.WORKOUT;
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
                          <Text style={styles.workoutMeta}>
                            {workout.workoutExercises?.length ?? 0}{" "}
                            {i18n.t("workouts.exercises")}
                            {" · "}
                            {workout.scheduledAt
                              ? new Date(
                                  workout.scheduledAt,
                                ).toLocaleDateString(i18n.locale, {
                                  month: "short",
                                  day: "numeric",
                                })
                              : new Date(workout.createdAt).toLocaleDateString(
                                  i18n.locale,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDelete(workout.id, workout.name);
                          }}
                          activeOpacity={0.7}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color="#888888"
                          />
                        </TouchableOpacity>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          ));
        })()}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {i18n.t("workouts.newWorkout")}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#888888" />
              </TouchableOpacity>
            </View>

            <Input
              label={i18n.t("workouts.workoutName")}
              placeholder={i18n.t("workouts.workoutNamePlaceholder")}
              value={workoutName}
              onChangeText={setWorkoutName}
              autoFocus
            />

            <Button
              title={i18n.t("workouts.createWorkout")}
              onPress={handleCreate}
              loading={createMutation.isPending}
            />
          </View>
        </View>
      </Modal>
      <AlertModal
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
      />

      <AlertModal
        visible={!!deleteTarget}
        title={i18n.t("workouts.deleteWorkout")}
        message={`${i18n.t("workouts.deleteConfirm")} "${deleteTarget?.name}"?`}
        type="error"
        onClose={() => setDeleteTarget(null)}
        confirmText={i18n.t("common.delete")}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        cancelText={i18n.t("common.cancel")}
      />
    </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: "#00FF87",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  emptyText: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
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
    width: 44,
    height: 44,
    backgroundColor: "rgba(0,255,135,0.1)",
    borderRadius: 12,
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
  workoutMeta: {
    color: "#888888",
    fontSize: 13,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
  },
  groupContainer: {
    marginBottom: 16,
  },
  groupLabel: {
    color: "#888888",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});
