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
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { workoutsApi } from "../../lib/api/workouts";
import { exercisesApi } from "../../lib/api/exercises";
import { sessionsApi } from "../../lib/api/sessions";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { AlertModal } from "../../components/ui/AlertModal";
import {
  MUSCLE_GROUP_COLORS,
  getWorkoutColor,
  getMuscleGroupColor,
} from "../../lib/constants/muscleGroups";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [addExerciseModal, setAddExerciseModal] = useState(false);
  const [sessionModal, setSessionModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [editForm, setEditForm] = useState({ sets: "", reps: "", weight: "" });
  const [exerciseForm, setExerciseForm] = useState({
    sets: "3",
    reps: "10",
    weight: "",
  });
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "warning" | "success" | "info",
  });

  const [exerciseSearch, setExerciseSearch] = useState("");

  const [deleteExerciseTarget, setDeleteExerciseTarget] = useState<
    string | null
  >(null);

  const { data: workout, isLoading } = useQuery({
    queryKey: ["workout", id],
    queryFn: async () => {
      try {
        const result = await workoutsApi.getById(id);
        return result;
      } catch (err) {
        throw err;
      }
    },
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: exercisesData } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => exercisesApi.getAll(1, 100),
  });

  const { data: sessionsData } = useQuery({
    queryKey: ["sessions", "workout", id],
    queryFn: () => sessionsApi.getByWorkout(id),
  });

  const updateMutation = useMutation({
    mutationFn: async (exercises: any[]) => {
      const result = await workoutsApi.update(id, { exercises });
      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workout", id] });
      await queryClient.invalidateQueries({ queryKey: ["workouts"] });
      await queryClient.refetchQueries({ queryKey: ["workout", id] });
      setAddExerciseModal(false);
      setSelectedExercise(null);
      setExerciseForm({ sets: "3", reps: "10", weight: "" });
    },
    onError: () => {
      setAlertConfig({
        title: "Error",
        message: "Could not update workout.",
        type: "error",
      });
      setAlertVisible(true);
    },
  });

  const sessionMutation = useMutation({
    mutationFn: () =>
      sessionsApi.create({
        workoutId: id,
        notes: sessionNotes.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      setSessionModal(false);
      setSessionNotes("");
      setAlertConfig({
        title: "Session Logged",
        message: "Great job! Your session has been recorded.",
        type: "success",
      });
      setAlertVisible(true);
    },
    onError: () => {
      setAlertConfig({
        title: "Error",
        message: "Could not log session.",
        type: "error",
      });
      setAlertVisible(true);
    },
  });

  const handleAddExercise = () => {
    if (!selectedExercise) {
      setAlertConfig({
        title: "No Exercise Selected",
        message: "Please select an exercise.",
        type: "warning",
      });
      setAlertVisible(true);
      return;
    }

    const sets = parseInt(exerciseForm.sets);
    const reps = parseInt(exerciseForm.reps);
    const weight = exerciseForm.weight
      ? parseFloat(exerciseForm.weight)
      : undefined;

    if (!sets || !reps) {
      setAlertConfig({
        title: "Invalid Values",
        message: "Please enter valid sets and reps.",
        type: "warning",
      });
      setAlertVisible(true);
      return;
    }

    const currentExercises =
      workout?.workoutExercises?.map((we: any) => ({
        exerciseId: we.exerciseId,
        sets: we.sets,
        reps: we.reps,
        weight: we.weight ?? undefined,
      })) ?? [];

    updateMutation.mutate([
      ...currentExercises,
      { exerciseId: selectedExercise.id, sets, reps, weight },
    ]);
  };

  const handleEditExercise = (we: any) => {
    setEditingExercise(we);
    setEditForm({
      sets: String(we.sets),
      reps: String(we.reps),
      weight: we.weight ? String(we.weight) : "",
    });
  };

  const handleSaveEdit = () => {
    const sets = parseInt(editForm.sets);
    const reps = parseInt(editForm.reps);
    const weight = editForm.weight ? parseFloat(editForm.weight) : undefined;

    if (!sets || !reps) {
      setAlertConfig({
        title: "Invalid Values",
        message: "Please enter valid sets and reps.",
        type: "warning",
      });
      setAlertVisible(true);
      return;
    }

    const updated =
      workout?.workoutExercises?.map((we: any) => {
        if (we.id === editingExercise.id) {
          return { exerciseId: we.exerciseId, sets, reps, weight };
        }
        return {
          exerciseId: we.exerciseId,
          sets: we.sets,
          reps: we.reps,
          weight: we.weight ?? undefined,
        };
      }) ?? [];

    updateMutation.mutate(updated);
    setEditingExercise(null);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    const updated =
      workout?.workoutExercises
        ?.filter((we: any) => we.exerciseId !== exerciseId)
        .map((we: any) => ({
          exerciseId: we.exerciseId,
          sets: we.sets,
          reps: we.reps,
          weight: we.weight ?? undefined,
        })) ?? [];

    updateMutation.mutate(updated);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {workout?.name ?? "Workout"}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddExerciseModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#0F0F0F" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading && (
          <View style={styles.loadingInline}>
            <ActivityIndicator color="#00FF87" size="large" />
          </View>
        )}

        {!isLoading &&
          (!workout?.workoutExercises ||
            workout.workoutExercises.length === 0) && (
            <Card>
              <View style={styles.emptyContainer}>
                <Ionicons name="barbell-outline" size={48} color="#2A2A2A" />
                <Text style={styles.emptyTitle}>No exercises yet</Text>
                <Text style={styles.emptyText}>
                  Tap the + button to add exercises
                </Text>
              </View>
            </Card>
          )}

        {!isLoading &&
          workout?.workoutExercises?.map((we: any) => {
            const color = getMuscleGroupColor(we.exercise?.muscleGroup);
            return (
              <Card
                key={we.id}
                style={[
                  styles.exerciseCard,
                  { borderLeftWidth: 4, borderLeftColor: color },
                ]}
              >
                <View style={styles.exerciseRow}>
                  <View
                    style={[
                      styles.exerciseIcon,
                      { backgroundColor: `${color}20` },
                    ]}
                  >
                    <Ionicons name="barbell-outline" size={20} color={color} />
                  </View>
                  <View style={styles.exerciseInfo}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/exercise/[id]",
                          params: {
                            id: we.exerciseId,
                            name: we.exercise?.name,
                            muscleGroup: we.exercise?.muscleGroup,
                            equipment: we.exercise?.equipment ?? "",
                            description: we.exercise?.description ?? "",
                          },
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.exerciseName]}>
                        {we.exercise?.name}
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.exerciseMeta}>
                      <Badge label={`${we.sets} sets`} variant="muted" />
                      <Badge label={`${we.reps} reps`} variant="muted" />
                      {we.weight && (
                        <Badge
                          label={`${we.weight} ${we.unitSystem === "IMPERIAL" ? "lb" : "kg"}`}
                          variant="primary"
                        />
                      )}
                    </View>
                  </View>
                  <View style={styles.exerciseActions}>
                    <TouchableOpacity
                      onPress={() => handleEditExercise(we)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={20}
                        color="#888888"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setDeleteExerciseTarget(we.exerciseId)}
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
                </View>
              </Card>
            );
          })}

        {!isLoading && workout?.workoutExercises?.length > 0 && (
          <Button
            title="Log Session"
            onPress={() => setSessionModal(true)}
            variant="primary"
          />
        )}
      </ScrollView>

      <Modal
        visible={addExerciseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setAddExerciseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Exercise</Text>
                <TouchableOpacity
                  onPress={() => setAddExerciseModal(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#888888" />
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Select Exercise</Text>
              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={16} color="#888888" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search exercises..."
                  placeholderTextColor="#888888"
                  value={exerciseSearch}
                  onChangeText={setExerciseSearch}
                  autoCapitalize="none"
                />
                {exerciseSearch.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setExerciseSearch("")}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={16} color="#888888" />
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView style={styles.exerciseList} nestedScrollEnabled>
                {(exercisesData?.data ?? [])
                  .filter(
                    (e: any) =>
                      exerciseSearch.length === 0 ||
                      e.name
                        .toLowerCase()
                        .includes(exerciseSearch.toLowerCase()) ||
                      e.equipment
                        ?.toLowerCase()
                        .includes(exerciseSearch.toLowerCase()),
                  )
                  .map((exercise: any) => (
                    <TouchableOpacity
                      key={exercise.id}
                      style={[
                        styles.exerciseOption,
                        selectedExercise?.id === exercise.id &&
                          styles.exerciseOptionActive,
                      ]}
                      onPress={() => setSelectedExercise(exercise)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.exerciseOptionIcon,
                          {
                            backgroundColor: `${MUSCLE_GROUP_COLORS[exercise.muscleGroup]}20`,
                          },
                        ]}
                      >
                        <Ionicons
                          name="barbell-outline"
                          size={16}
                          color={
                            MUSCLE_GROUP_COLORS[exercise.muscleGroup] ??
                            "#888888"
                          }
                        />
                      </View>
                      <Text
                        style={[
                          styles.exerciseOptionText,
                          selectedExercise?.id === exercise.id &&
                            styles.exerciseOptionTextActive,
                        ]}
                      >
                        {exercise.name}
                      </Text>
                      {selectedExercise?.id === exercise.id && (
                        <Ionicons name="checkmark" size={20} color="#00FF87" />
                      )}
                    </TouchableOpacity>
                  ))}
              </ScrollView>

              <View style={styles.formRow}>
                <View style={styles.formThird}>
                  <Input
                    label="Sets"
                    placeholder="3"
                    keyboardType="numeric"
                    value={exerciseForm.sets}
                    onChangeText={(v) =>
                      setExerciseForm({ ...exerciseForm, sets: v })
                    }
                  />
                </View>
                <View style={styles.formThird}>
                  <Input
                    label="Reps"
                    placeholder="10"
                    keyboardType="numeric"
                    value={exerciseForm.reps}
                    onChangeText={(v) =>
                      setExerciseForm({ ...exerciseForm, reps: v })
                    }
                  />
                </View>
                <View style={styles.formThird}>
                  <Input
                    label="Weight"
                    placeholder="0"
                    keyboardType="decimal-pad"
                    value={exerciseForm.weight}
                    onChangeText={(v) =>
                      setExerciseForm({ ...exerciseForm, weight: v })
                    }
                  />
                </View>
              </View>

              <Button
                title="Add Exercise"
                onPress={handleAddExercise}
                loading={updateMutation.isPending}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={!!editingExercise}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingExercise(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingExercise?.exercise?.name}
              </Text>
              <TouchableOpacity
                onPress={() => setEditingExercise(null)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#888888" />
              </TouchableOpacity>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formThird}>
                <Input
                  label="Sets"
                  placeholder="3"
                  keyboardType="numeric"
                  value={editForm.sets}
                  onChangeText={(v) => setEditForm({ ...editForm, sets: v })}
                />
              </View>
              <View style={styles.formThird}>
                <Input
                  label="Reps"
                  placeholder="10"
                  keyboardType="numeric"
                  value={editForm.reps}
                  onChangeText={(v) => setEditForm({ ...editForm, reps: v })}
                />
              </View>
              <View style={styles.formThird}>
                <Input
                  label="Weight"
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={editForm.weight}
                  onChangeText={(v) => setEditForm({ ...editForm, weight: v })}
                />
              </View>
            </View>

            <Button
              title="Save Changes"
              onPress={handleSaveEdit}
              loading={updateMutation.isPending}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={sessionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Session</Text>
              <TouchableOpacity
                onPress={() => setSessionModal(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#888888" />
              </TouchableOpacity>
            </View>
            <Text style={styles.sessionSummary}>
              {workout?.workoutExercises?.length} exercises · {workout?.name}
            </Text>

            <Input
              label="Notes (optional)"
              placeholder="How did it go?"
              value={sessionNotes}
              onChangeText={setSessionNotes}
              multiline
              numberOfLines={3}
            />

            <Button
              title="Complete Session"
              onPress={() => sessionMutation.mutate()}
              loading={sessionMutation.isPending}
            />
          </View>
        </View>
      </Modal>

      {!isLoading && sessionsData && sessionsData.length > 0 && (
        <View style={styles.sessionsSection}>
          <Text style={styles.sessionsSectionTitle}>Session History</Text>
          {sessionsData.map((session: any) => (
            <Card key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionRow}>
                <View style={styles.sessionIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#00FF87" />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionDate}>
                    {new Date(session.completedAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                  {session.notes && (
                    <Text style={styles.sessionNotes} numberOfLines={1}>
                      {session.notes}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      <AlertModal
        visible={!!deleteExerciseTarget}
        title="Remove Exercise"
        message="Are you sure you want to remove this exercise from the workout?"
        type="error"
        onClose={() => setDeleteExerciseTarget(null)}
        confirmText="Remove"
        onConfirm={() => {
          if (deleteExerciseTarget) {
            handleRemoveExercise(deleteExerciseTarget);
            setDeleteExerciseTarget(null);
          }
        }}
        cancelText="Cancel"
      />

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
  container: { flex: 1, backgroundColor: "#0F0F0F", paddingBottom: 60 },
  loading: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingInline: {
    paddingVertical: 40,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  title: { flex: 1, color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  addButton: {
    width: 36,
    height: 36,
    backgroundColor: "#00FF87",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { padding: 20, gap: 12 },
  emptyContainer: { alignItems: "center", paddingVertical: 32, gap: 12 },
  emptyTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  emptyText: { color: "#888888", fontSize: 14, textAlign: "center" },
  exerciseCard: {},
  exerciseRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  exerciseIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseInfo: { flex: 1, gap: 6 },
  exerciseName: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  exerciseMeta: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  exerciseActions: {
    flexDirection: "column",
    gap: 12,
    alignItems: "center",
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
  modalTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  fieldLabel: {
    color: "#888888",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  exerciseList: { maxHeight: 400, marginBottom: 16 },
  exerciseOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: "#2A2A2A",
  },
  exerciseOptionActive: {
    backgroundColor: "rgba(0,255,135,0.1)",
    borderWidth: 1,
    borderColor: "#00FF87",
  },
  exerciseOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseOptionText: {
    flex: 1,
    color: "#888888",
    fontSize: 14,
    fontWeight: "500",
  },
  exerciseOptionTextActive: { color: "#FFFFFF" },
  formRow: { flexDirection: "row", gap: 12 },
  formThird: { flex: 1 },
  sessionSummary: { color: "#888888", fontSize: 14, marginBottom: 16 },
  sessionsSection: { gap: 8 },
  sessionsSectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  sessionCard: { paddingVertical: 12 },
  sessionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sessionIcon: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(0,255,135,0.1)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sessionInfo: { flex: 1 },
  sessionDate: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  sessionNotes: { color: "#888888", fontSize: 13, marginTop: 2 },
});
