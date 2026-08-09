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
import { progressApi } from "../../lib/api/progress";
import { exercisesApi } from "../../lib/api/exercises";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AlertModal } from "../../components/ui/AlertModal";
import { LineChart } from "../../components/ui/LineChart";
import {
  MUSCLE_GROUP_COLORS,
  getMuscleGroupColor,
  getWorkoutColor,
} from "../../lib/constants/muscleGroups";

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "warning" | "success" | "info",
  });
  const [activeTab, setActiveTab] = useState<"weight" | "exercise">("weight");
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["progress"],
    queryFn: () => progressApi.getAll(1, 30),
  });

  const { data: exercisesData } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => exercisesApi.getAll(1, 100),
  });

  const { data: exerciseProgressData, isLoading: exerciseProgressLoading } =
    useQuery({
      queryKey: ["progress", "exercise", selectedExercise?.id],
      queryFn: () => progressApi.getExerciseProgress(selectedExercise.id),
      enabled: !!selectedExercise,
    });

  const logMutation = useMutation({
    mutationFn: progressApi.log,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      setModalVisible(false);
      setWeight("");
      setNotes("");
      setAlertConfig({
        title: "Logged",
        message: "Progress entry saved successfully.",
        type: "success",
      });
      setAlertVisible(true);
    },
    onError: () => {
      setAlertConfig({
        title: "Error",
        message: "Could not save progress entry.",
        type: "error",
      });
      setAlertVisible(true);
    },
  });

  const handleLog = () => {
    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      setAlertConfig({
        title: "Invalid Weight",
        message: "Please enter a valid weight.",
        type: "warning",
      });
      setAlertVisible(true);
      return;
    }
    logMutation.mutate({ weight: weightNum, notes: notes.trim() || undefined });
  };

  const weightChartData = [...(data?.data ?? [])]
    .reverse()
    .map((entry: any) => ({
      value: entry.weight,
      label: new Date(entry.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));

  const exerciseChartData = (exerciseProgressData ?? [])
    .filter((e: any) => e.weight)
    .map((entry: any) => ({
      value: entry.weight,
      label: new Date(entry.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));

  const latest = data?.data?.[0];
  const previous = data?.data?.[1];
  const diff =
    latest && previous ? (latest.weight - previous.weight).toFixed(1) : null;
  const unit = latest?.unitSystem === "IMPERIAL" ? "lb" : "kg";

  const filteredExercises = (exercisesData?.data ?? []).filter(
    (e: any) =>
      exerciseSearch.length === 0 ||
      e.name.toLowerCase().includes(exerciseSearch.toLowerCase()),
  );

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
          <Text style={styles.title}>Progress</Text>
          {activeTab === "weight" && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={24} color="#0F0F0F" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "weight" && styles.tabActive]}
            onPress={() => setActiveTab("weight")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "weight" && styles.tabTextActive,
              ]}
            >
              Body Weight
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "exercise" && styles.tabActive]}
            onPress={() => setActiveTab("exercise")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "exercise" && styles.tabTextActive,
              ]}
            >
              Exercise
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "weight" && (
          <>
            {latest && (
              <View style={styles.statsRow}>
                <Card style={styles.statCard}>
                  <Text style={styles.statLabel}>Current Weight</Text>
                  <Text style={styles.statValue}>{latest.weight}</Text>
                  <Text style={styles.statUnit}>{unit}</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Text style={styles.statLabel}>Change</Text>
                  <Text
                    style={[
                      styles.statValue,
                      diff
                        ? parseFloat(diff) > 0
                          ? styles.valueUp
                          : styles.valueDown
                        : null,
                    ]}
                  >
                    {diff ? (parseFloat(diff) > 0 ? `+${diff}` : diff) : "--"}
                  </Text>
                  <Text style={styles.statUnit}>from last</Text>
                </Card>
              </View>
            )}

            {weightChartData.length > 1 ? (
              <Card style={styles.chartCard}>
                <Text style={styles.chartTitle}>Weight Over Time</Text>
                <LineChart data={weightChartData} unit={unit} />
              </Card>
            ) : (
              <Card style={styles.emptyChart}>
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="trending-up-outline"
                    size={48}
                    color="#2A2A2A"
                  />
                  <Text style={styles.emptyTitle}>Not enough data</Text>
                  <Text style={styles.emptyText}>
                    Log at least 2 entries to see your chart
                  </Text>
                </View>
              </Card>
            )}

            <Text style={styles.sectionTitle}>History</Text>

            {data?.data?.length === 0 && (
              <Card>
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No entries yet. Start tracking your weight!
                  </Text>
                </View>
              </Card>
            )}

            {data?.data?.map((entry: any) => (
              <Card key={entry.id} style={styles.entryCard}>
                <View style={styles.entryRow}>
                  <View
                    style={[
                      styles.entryIcon,
                      {
                        backgroundColor: `${getMuscleGroupColor(selectedExercise?.muscleGroup)}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="barbell-outline"
                      size={20}
                      color={getMuscleGroupColor(selectedExercise?.muscleGroup)}
                    />
                  </View>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryWeight}>
                      {entry.weight}{" "}
                      {entry.unitSystem === "IMPERIAL" ? "lb" : "kg"}
                    </Text>
                    <Text style={styles.entryDate}>
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                  {entry.notes && (
                    <Text style={styles.entryNotes} numberOfLines={1}>
                      {entry.notes}
                    </Text>
                  )}
                </View>
              </Card>
            ))}
          </>
        )}

        {activeTab === "exercise" && (
          <>
            <TouchableOpacity
              style={styles.exercisePicker}
              onPress={() => setShowExercisePicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="barbell-outline"
                size={20}
                color={getMuscleGroupColor(selectedExercise?.muscleGroup)}
              />
              <Text
                style={[
                  styles.exercisePickerText,
                  selectedExercise && styles.exercisePickerTextActive,
                ]}
              >
                {selectedExercise
                  ? selectedExercise.name
                  : "Select an exercise"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#888888" />
            </TouchableOpacity>

            {!selectedExercise && (
              <Card style={styles.emptyChart}>
                <View style={styles.emptyContainer}>
                  <Ionicons name="barbell-outline" size={48} color="#2A2A2A" />
                  <Text style={styles.emptyTitle}>Select an exercise</Text>
                  <Text style={styles.emptyText}>
                    Choose an exercise to see your weight progression
                  </Text>
                </View>
              </Card>
            )}

            {selectedExercise && exerciseProgressLoading && (
              <View style={styles.loading}>
                <ActivityIndicator color="#00FF87" size="large" />
              </View>
            )}

            {selectedExercise &&
              !exerciseProgressLoading &&
              exerciseChartData.length > 0 && (
                <>
                  <View style={styles.statsRow}>
                    <Card style={styles.statCard}>
                      <Text style={styles.statLabel}>Best Weight</Text>
                      <Text style={styles.statValue}>
                        {Math.max(
                          ...exerciseChartData.map((e: any) => e.value),
                        )}
                      </Text>
                      <Text style={styles.statUnit}>
                        {exerciseProgressData?.[0]?.unitSystem === "IMPERIAL"
                          ? "lb"
                          : "kg"}
                      </Text>
                    </Card>
                    <Card style={styles.statCard}>
                      <Text style={styles.statLabel}>Sessions</Text>
                      <Text style={styles.statValue}>
                        {exerciseChartData.length}
                      </Text>
                      <Text style={styles.statUnit}>logged</Text>
                    </Card>
                  </View>

                  {exerciseChartData.length > 1 && (
                    <Card style={styles.chartCard}>
                      <Text style={styles.chartTitle}>Weight Progression</Text>
                      <LineChart
                        data={exerciseChartData}
                        unit={
                          exerciseProgressData?.[0]?.unitSystem === "IMPERIAL"
                            ? "lb"
                            : "kg"
                        }
                        color={getMuscleGroupColor(selectedExercise?.muscleGroup)}
                      />
                    </Card>
                  )}

                  <Text style={styles.sectionTitle}>History</Text>
                  {exerciseProgressData
                    ?.filter((e: any) => e.weight)
                    .map((entry: any, index: number) => (
                      <Card
                        key={index}
                        style={[
                          styles.entryCard,
                          {
                            borderLeftWidth: 4,
                            borderLeftColor: getMuscleGroupColor(
                              selectedExercise?.muscleGroup,
                            ),
                          },
                        ]}
                      >
                        <View style={styles.entryRow}>
                          <View
                            style={[
                              styles.entryIcon,
                              {
                                backgroundColor: `${getMuscleGroupColor(selectedExercise?.muscleGroup)}20`,
                              },
                            ]}
                          >
                            <Ionicons
                              name="barbell-outline"
                              size={20}
                              color={getMuscleGroupColor(
                                selectedExercise?.muscleGroup,
                              )}
                            />
                          </View>
                          <View style={styles.entryInfo}>
                            <Text style={styles.entryWeight}>
                              {entry.weight}{" "}
                              {entry.unitSystem === "IMPERIAL" ? "lb" : "kg"} ·{" "}
                              {entry.sets}x{entry.reps}
                            </Text>
                            <Text style={styles.entryDate}>
                              {new Date(entry.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </Text>
                          </View>
                        </View>
                      </Card>
                    ))}
                </>
              )}

            {selectedExercise &&
              !exerciseProgressLoading &&
              exerciseChartData.length === 0 && (
                <Card style={styles.emptyChart}>
                  <View style={styles.emptyContainer}>
                    <Ionicons
                      name="trending-up-outline"
                      size={48}
                      color="#2A2A2A"
                    />
                    <Text style={styles.emptyTitle}>No data yet</Text>
                    <Text style={styles.emptyText}>
                      Log sessions with {selectedExercise.name} to track your
                      progression
                    </Text>
                  </View>
                </Card>
              )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={showExercisePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExercisePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Exercise</Text>
              <TouchableOpacity
                onPress={() => setShowExercisePicker(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#888888" />
              </TouchableOpacity>
            </View>
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
            <ScrollView style={styles.exerciseList}>
              {filteredExercises.map((exercise: any) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={[
                    styles.exerciseOption,
                    selectedExercise?.id === exercise.id &&
                      styles.exerciseOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedExercise(exercise);
                    setShowExercisePicker(false);
                    setExerciseSearch("");
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.exerciseOptionIcon,
                      {
                        backgroundColor: `${
                          MUSCLE_GROUP_COLORS[exercise.muscleGroup] ?? "#888888"
                        }20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="barbell-outline"
                      size={16}
                      color={
                        MUSCLE_GROUP_COLORS[exercise.muscleGroup] ?? "#888888"
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
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Weight</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#888888" />
              </TouchableOpacity>
            </View>
            <Input
              label="Weight"
              placeholder="e.g. 75.5"
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
            />
            <Input
              label="Notes (optional)"
              placeholder="How are you feeling?"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
            <Button
              title="Save Entry"
              onPress={handleLog}
              loading={logMutation.isPending}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F0F0F" },
  loading: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    justifyContent: "center",
    alignItems: "center",
  },
  content: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "bold" },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: "#00FF87",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  tabActive: { backgroundColor: "#00FF87" },
  tabText: { color: "#888888", fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: "#0F0F0F" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 16 },
  statLabel: { color: "#888888", fontSize: 13, marginBottom: 4 },
  statValue: { color: "#FFFFFF", fontSize: 28, fontWeight: "bold" },
  statUnit: { color: "#888888", fontSize: 12, marginTop: 2 },
  valueUp: { color: "#EF4444" },
  valueDown: { color: "#00FF87" },
  chartCard: { marginBottom: 24 },
  chartTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  emptyChart: { marginBottom: 24 },
  emptyContainer: { alignItems: "center", paddingVertical: 24, gap: 12 },
  emptyTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
  emptyText: { color: "#888888", fontSize: 14, textAlign: "center" },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  entryCard: { marginBottom: 12 },
  entryRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  entryIcon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(0,255,135,0.1)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  entryInfo: { flex: 1 },
  entryWeight: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  entryDate: { color: "#888888", fontSize: 13, marginTop: 2 },
  entryNotes: { color: "#888888", fontSize: 13, maxWidth: 100 },
  exercisePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  exercisePickerText: { flex: 1, color: "#888888", fontSize: 15 },
  exercisePickerTextActive: { color: "#FFFFFF", fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    height: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: { flex: 1, color: "#FFFFFF", fontSize: 14 },
  exerciseList: { flex: 1 },
  exerciseOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: "#2A2A2A",
  },
  exerciseOptionText: { color: "#888888", fontSize: 15 },
  exerciseOptionTextActive: { color: "#FFFFFF", fontWeight: "600" },
  exerciseOptionActive: {
    backgroundColor: "rgba(0,255,135,0.1)",
    borderWidth: 2,
    borderColor: "#00FF87",
  },
  exerciseOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
