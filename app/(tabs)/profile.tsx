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
import { profileApi } from "../../lib/api/profile";
import { achievementsApi } from "../../lib/api/achievements";
import { statsApi } from "../../lib/api/stats";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AlertModal } from "../../components/ui/AlertModal";
import { useAuthStore } from "../../store/authStore";
import { getMuscleGroupColor } from "../../lib/constants/muscleGroups";

const GOAL_LABELS: Record<string, string> = {
  LOSE_WEIGHT: "Lose Weight",
  GAIN_MUSCLE: "Gain Muscle",
  MAINTAIN: "Maintain",
  IMPROVE_ENDURANCE: "Improve Endurance",
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const TRAINING_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [logoutAlertVisible, setLogoutAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "error" | "warning" | "success" | "info",
  });

  const [form, setForm] = useState({
    age: "",
    weight: "",
    height: "",
    goal: "",
    level: "",
    unitSystem: "METRIC",
    trainingDays: [] as string[],
  });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.get,
  });

  const { data: achievementsData, isLoading: achievementsLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: achievementsApi.getAll,
  });

  const { data: statsData } = useQuery({
    queryKey: ["stats"],
    queryFn: statsApi.get,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      profileData ? profileApi.update(data) : profileApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setModalVisible(false);
      setAlertConfig({
        title: "Saved",
        message: "Profile updated successfully.",
        type: "success",
      });
      setAlertVisible(true);
    },
    onError: () => {
      setAlertConfig({
        title: "Error",
        message: "Could not save profile.",
        type: "error",
      });
      setAlertVisible(true);
    },
  });

  const openModal = () => {
    if (profileData) {
      const days = JSON.parse(profileData.trainingDays ?? "[]");
      setForm({
        age: String(profileData.age),
        weight: String(profileData.weight),
        height: String(profileData.height),
        goal: profileData.goal,
        level: profileData.level,
        unitSystem: profileData.unitSystem ?? "METRIC",
        trainingDays: days,
      });
    }
    setModalVisible(true);
  };

  const toggleDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      trainingDays: prev.trainingDays.includes(day)
        ? prev.trainingDays.filter((d) => d !== day)
        : [...prev.trainingDays, day],
    }));
  };

  const handleSave = () => {
    const age = parseInt(form.age);
    const weight = parseFloat(form.weight);
    const height = parseFloat(form.height);

    if (!age || !weight || !height) {
      setAlertConfig({
        title: "Missing Fields",
        message: "Please fill in all required fields.",
        type: "warning",
      });
      setAlertVisible(true);
      return;
    }

    if (!form.goal) {
      setAlertConfig({
        title: "Missing Goal",
        message: "Please select a fitness goal.",
        type: "warning",
      });
      setAlertVisible(true);
      return;
    }

    if (!form.level) {
      setAlertConfig({
        title: "Missing Level",
        message: "Please select your fitness level.",
        type: "warning",
      });
      setAlertVisible(true);
      return;
    }

    saveMutation.mutate({
      age,
      weight,
      height,
      goal: form.goal,
      level: form.level,
      unitSystem: form.unitSystem,
      trainingDays: JSON.stringify(form.trainingDays),
    });
  };

  const unlockedAchievements = (achievementsData ?? []).filter(
    (a: any) => a.unlocked,
  );
  const lockedAchievements = (achievementsData ?? []).filter(
    (a: any) => !a.unlocked,
  );

  if (profileLoading || achievementsLoading) {
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
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#00FF87" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.email}>{user?.email}</Text>
            <Badge label={user?.role ?? "USER"} variant="primary" />
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setLogoutAlertVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={24} color="#888888" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Ionicons name="flame" size={20} color="#FF6B35" />
            <Text style={styles.statValue}>
              {statsData?.currentStreak ?? 0}
            </Text>
            <Text style={styles.statLabel}>Streak</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="trophy-outline" size={20} color="#FBBF24" />
            <Text style={styles.statValue}>
              {statsData?.totalSessions ?? 0}
            </Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="star-outline" size={20} color="#00FF87" />
            <Text style={styles.statValue}>{statsData?.totalXp ?? 0}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fitness Profile</Text>
          <TouchableOpacity onPress={openModal} activeOpacity={0.7}>
            <Ionicons name="pencil-outline" size={20} color="#00FF87" />
          </TouchableOpacity>
        </View>

        {profileData ? (
          <Card style={styles.profileCard}>
            <View style={styles.profileGrid}>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Age</Text>
                <Text style={styles.profileValue}>{profileData.age} yrs</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Weight</Text>
                <Text style={styles.profileValue}>
                  {profileData.weight}{" "}
                  {profileData.unitSystem === "IMPERIAL" ? "lb" : "kg"}
                </Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Height</Text>
                <Text style={styles.profileValue}>
                  {profileData.height}{" "}
                  {profileData.unitSystem === "IMPERIAL" ? "in" : "cm"}
                </Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Units</Text>
                <Text style={styles.profileValue}>
                  {profileData.unitSystem}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.badgeRow}>
              <Badge
                label={GOAL_LABELS[profileData.goal] ?? profileData.goal}
                variant="primary"
              />
              <Badge
                label={LEVEL_LABELS[profileData.level] ?? profileData.level}
                variant="muted"
              />
            </View>
            {JSON.parse(profileData.trainingDays ?? "[]").length > 0 && (
              <View style={styles.trainingDaysRow}>
                {JSON.parse(profileData.trainingDays).map((day: string) => (
                  <View key={day} style={styles.dayChip}>
                    <Text style={styles.dayChipText}>{day}</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        ) : (
          <Card>
            <View style={styles.emptyContainer}>
              <Ionicons name="person-outline" size={40} color="#2A2A2A" />
              <Text style={styles.emptyText}>No profile yet</Text>
              <Button
                title="Create Profile"
                onPress={openModal}
                variant="outline"
              />
            </View>
          </Card>
        )}

        <Text style={styles.sectionTitle}>Achievements</Text>

        {unlockedAchievements.length > 0 && (
          <>
            <Text style={styles.achievementSubtitle}>Unlocked</Text>
            {unlockedAchievements.map((achievement: any) => (
              <Card
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  { borderLeftWidth: 4, borderLeftColor: "#FBBF24" },
                ]}
              >
                <View style={styles.achievementRow}>
                  <View style={styles.achievementIcon}>
                    <Ionicons name="trophy" size={22} color="#FBBF24" />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>
                      {achievement.name}
                    </Text>
                    <Text style={styles.achievementDesc}>
                      {achievement.description}
                    </Text>
                  </View>
                  <Badge
                    label={`+${achievement.xpReward} XP`}
                    variant="success"
                  />
                </View>
              </Card>
            ))}
          </>
        )}

        {lockedAchievements.length > 0 && (
          <>
            <Text style={styles.achievementSubtitle}>Locked</Text>
            {lockedAchievements.map((achievement: any) => (
              <Card
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  styles.lockedCard,
                  { borderLeftWidth: 4, borderLeftColor: "#2A2A2A" },
                ]}
              >
                <View style={styles.achievementRow}>
                  <View style={[styles.achievementIcon, styles.lockedIcon]}>
                    <Ionicons name="lock-closed" size={22} color="#888888" />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={[styles.achievementName, styles.lockedText]}>
                      {achievement.name}
                    </Text>
                    <Text style={styles.achievementDesc}>
                      {achievement.description}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {profileData ? "Edit Profile" : "Create Profile"}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#888888" />
                </TouchableOpacity>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  <Input
                    label="Age"
                    placeholder="25"
                    keyboardType="numeric"
                    value={form.age}
                    onChangeText={(v) => setForm({ ...form, age: v })}
                  />
                </View>
                <View style={styles.formHalf}>
                  <Input
                    label={`Weight (${form.unitSystem === "IMPERIAL" ? "lb" : "kg"})`}
                    placeholder="75"
                    keyboardType="decimal-pad"
                    value={form.weight}
                    onChangeText={(v) => setForm({ ...form, weight: v })}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  <Input
                    label={`Height (${form.unitSystem === "IMPERIAL" ? "in" : "cm"})`}
                    placeholder="175"
                    keyboardType="decimal-pad"
                    value={form.height}
                    onChangeText={(v) => setForm({ ...form, height: v })}
                  />
                </View>
                <View style={styles.formHalf}>
                  <Text style={styles.fieldLabel}>Units</Text>
                  <View style={styles.unitToggle}>
                    {["METRIC", "IMPERIAL"].map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[
                          styles.unitChip,
                          form.unitSystem === u && styles.unitChipActive,
                        ]}
                        onPress={() => setForm({ ...form, unitSystem: u })}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.unitChipText,
                            form.unitSystem === u && styles.unitChipTextActive,
                          ]}
                        >
                          {u === "METRIC" ? "kg/cm" : "lb/in"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Fitness Goal</Text>
              <View style={styles.optionsGrid}>
                {Object.entries(GOAL_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.optionChip,
                      form.goal === key && styles.optionChipActive,
                    ]}
                    onPress={() => setForm({ ...form, goal: key })}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        form.goal === key && styles.optionChipTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Fitness Level</Text>
              <View style={styles.optionsGrid}>
                {Object.entries(LEVEL_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.optionChip,
                      form.level === key && styles.optionChipActive,
                    ]}
                    onPress={() => setForm({ ...form, level: key })}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        form.level === key && styles.optionChipTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Training Days</Text>
              <View style={styles.daysGrid}>
                {TRAINING_DAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      form.trainingDays.includes(day) && styles.dayButtonActive,
                    ]}
                    onPress={() => toggleDay(day)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        form.trainingDays.includes(day) &&
                          styles.dayButtonTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title="Save Profile"
                onPress={handleSave}
                loading={saveMutation.isPending}
              />
            </View>
          </ScrollView>
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
        visible={logoutAlertVisible}
        title="Log Out"
        message="Are you sure you want to log out?"
        type="warning"
        onClose={() => setLogoutAlertVisible(false)}
        confirmText="Log Out"
        onConfirm={logout}
        cancelText="Cancel"
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
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(0,255,135,0.1)",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00FF87",
  },
  userInfo: { flex: 1, gap: 6 },
  email: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  logoutButton: { padding: 8 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 16 },
  statValue: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold" },
  statLabel: { color: "#888888", fontSize: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  profileCard: { marginBottom: 24 },
  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  profileItem: { width: "45%" },
  profileLabel: { color: "#888888", fontSize: 13, marginBottom: 4 },
  profileValue: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#2A2A2A", marginBottom: 16 },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  trainingDaysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(0,255,135,0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00FF87",
  },
  dayChipText: { color: "#00FF87", fontSize: 12, fontWeight: "600" },
  emptyContainer: { alignItems: "center", paddingVertical: 24, gap: 12 },
  emptyText: { color: "#888888", fontSize: 14 },
  achievementSubtitle: {
    color: "#888888",
    fontSize: 14,
    marginBottom: 8,
    marginTop: 4,
  },
  achievementCard: { marginBottom: 12 },
  lockedCard: { opacity: 0.5 },
  achievementRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  achievementIcon: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(251,191,36,0.1)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  lockedIcon: { backgroundColor: "#2A2A2A" },
  achievementInfo: { flex: 1 },
  achievementName: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  lockedText: { color: "#888888" },
  achievementDesc: { color: "#888888", fontSize: 13, marginTop: 2 },
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
  formRow: { flexDirection: "row", gap: 12 },
  formHalf: { flex: 1 },
  fieldLabel: {
    color: "#888888",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  unitToggle: { flexDirection: "row", gap: 8 },
  unitChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  unitChipActive: {
    backgroundColor: "rgba(0,255,135,0.1)",
    borderColor: "#00FF87",
  },
  unitChipText: { color: "#888888", fontSize: 13, fontWeight: "600" },
  unitChipTextActive: { color: "#00FF87" },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  optionChipActive: {
    backgroundColor: "rgba(0,255,135,0.1)",
    borderColor: "#00FF87",
  },
  optionChipText: { color: "#888888", fontSize: 13, fontWeight: "600" },
  optionChipTextActive: { color: "#00FF87" },
  daysGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  dayButtonActive: {
    backgroundColor: "rgba(0,255,135,0.1)",
    borderColor: "#00FF87",
  },
  dayButtonText: { color: "#888888", fontSize: 11, fontWeight: "600" },
  dayButtonTextActive: { color: "#00FF87" },
});
