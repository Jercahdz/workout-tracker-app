import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { progressApi } from "../../lib/api/progress";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AlertModal } from "../../components/ui/AlertModal";
import { LineChart } from "../../components/ui/LineChart";

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

  const { data, isLoading } = useQuery({
    queryKey: ["progress"],
    queryFn: () => progressApi.getAll(1, 30),
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

  const chartData = [...(data?.data ?? [])].reverse().map((entry: any) => ({
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
          <View>
            <Text style={styles.title}>Progress</Text>
            <Text style={styles.subtitle}>
              {data?.meta?.total ?? 0} entries logged
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color="#0F0F0F" />
          </TouchableOpacity>
        </View>

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

        {chartData.length > 1 ? (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Weight Over Time</Text>
            <LineChart data={chartData} unit={unit} />
          </Card>
        ) : (
          <Card style={styles.emptyChart}>
            <View style={styles.emptyContainer}>
              <Ionicons name="trending-up-outline" size={48} color="#2A2A2A" />
              <Text style={styles.emptyTitle}>Not enough data</Text>
              <Text style={styles.emptyText}>
                Log at least 2 entries to see your progress chart
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
              <View style={styles.entryIcon}>
                <Ionicons name="scale-outline" size={20} color="#00FF87" />
              </View>
              <View style={styles.entryInfo}>
                <Text style={styles.entryWeight}>
                  {entry.weight} {entry.unitSystem === "IMPERIAL" ? "lb" : "kg"}
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
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "bold" },
  subtitle: { color: "#888888", fontSize: 14, marginTop: 4 },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: "#00FF87",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
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
});
