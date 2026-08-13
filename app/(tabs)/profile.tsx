import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import i18n from "../../lib/i18n";
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

const PROFILE_ICONS = {
  PROFILE: require("../../assets/icons/app_profile.png"),
  STREAK: require("../../assets/icons/app_streak.png"),
  XP: require("../../assets/icons/app_xp.png"),
  ACHIEVEMENT: require("../../assets/icons/app_achievement.png"),
  SHIELD: require("../../assets/icons/app_shield.png"),
};

const ACHIEVEMENT_ICONS: Record<string, any> = {
  "Consistency King": require("../../assets/icons/app_consistency_king.png"),
  "AI Powered": require("../../assets/icons/app_ai_powered.png"),
  "First Rep": require("../../assets/icons/app_first_rep.png"),
  "Century": require("../../assets/icons/app_century.png"),
  "Iron Will": require("../../assets/icons/app_iron_will.png"),
  "On Fire": require("../../assets/icons/app_on_fire.png"),
  "Unstoppable": require("../../assets/icons/app_unstoppable.png"),
};

const TRAINING_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const GOALS = ["LOSE_WEIGHT", "GAIN_MUSCLE", "MAINTAIN", "IMPROVE_ENDURANCE"];

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

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
        title: i18n.t("profile.saved"),
        message: i18n.t("profile.savedMsg"),
        type: "success",
      });
      setAlertVisible(true);
    },
    onError: () => {
      setAlertConfig({
        title: "Error",
        message: i18n.t("profile.errorSave"),
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
        title: i18n.t("profile.missingFields"),
        message: i18n.t("profile.missingFieldsMsg"),
        type: "warning",
      });
      setAlertVisible(true);
      return;
    }

    if (!form.goal) {
      setAlertConfig({
        title: i18n.t("profile.missingGoal"),
        message: i18n.t("profile.missingGoalMsg"),
        type: "warning",
      });
      setAlertVisible(true);
      return;
    }

    if (!form.level) {
      setAlertConfig({
        title: i18n.t("profile.missingLevel"),
        message: i18n.t("profile.missingLevelMsg"),
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
            <Image
              source={PROFILE_ICONS.PROFILE}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
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
            <Ionicons name="log-out-outline" size={28} color="#888888" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Image
              source={PROFILE_ICONS.STREAK}
              style={{ width: 32, height: 32, }}
              resizeMode="contain"
            />
            <Text style={styles.statValue}>
              {statsData?.currentStreak ?? 0}
            </Text>
            <Text style={styles.statLabel}>
              {i18n.t("profile.stats.streak")}
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <Image
              source={PROFILE_ICONS.SHIELD}
              style={{ width: 32, height: 32}}
              resizeMode="contain"
            />
            <Text style={styles.statValue}>
              {statsData?.totalSessions ?? 0}
            </Text>
            <Text style={styles.statLabel}>
              {i18n.t("profile.stats.sessions")}
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <Image
              source={PROFILE_ICONS.XP}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
            <Text style={styles.statValue}>{statsData?.totalXp ?? 0}</Text>
            <Text style={styles.statLabel}>{i18n.t("profile.stats.xp")}</Text>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {i18n.t("profile.fitnessProfile")}
          </Text>
          <TouchableOpacity onPress={openModal} activeOpacity={0.7}>
            <Ionicons name="pencil-outline" size={20} color="#00FF87" />
          </TouchableOpacity>
        </View>

        {profileData ? (
          <Card style={styles.profileCard}>
            <View style={styles.profileGrid}>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>{i18n.t("profile.age")}</Text>
                <Text style={styles.profileValue}>{profileData.age}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>
                  {i18n.t("profile.weight")}
                </Text>
                <Text style={styles.profileValue}>
                  {profileData.weight}{" "}
                  {profileData.unitSystem === "IMPERIAL" ? "lb" : "kg"}
                </Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>
                  {i18n.t("profile.height")}
                </Text>
                <Text style={styles.profileValue}>
                  {profileData.height}{" "}
                  {profileData.unitSystem === "IMPERIAL" ? "in" : "cm"}
                </Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>
                  {i18n.t("profile.units")}
                </Text>
                <Text style={styles.profileValue}>
                  {profileData.unitSystem}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.badgeRow}>
              <Badge
                label={i18n.t(`profile.goals.${profileData.goal}`)}
                variant="primary"
              />
              <Badge
                label={i18n.t(`profile.levels.${profileData.level}`)}
                variant="muted"
              />
            </View>
            {JSON.parse(profileData.trainingDays ?? "[]").length > 0 && (
              <View style={styles.trainingDaysRow}>
                {JSON.parse(profileData.trainingDays).map((day: string) => (
                  <View key={day} style={styles.dayChip}>
                    <Text style={styles.dayChipText}>
                      {i18n.t(`profile.days.${day}`)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        ) : (
          <Card>
            <View style={styles.emptyContainer}>
              <Ionicons name="person-outline" size={40} color="#2A2A2A" />
              <Text style={styles.emptyText}>
                {i18n.t("profile.noProfile")}
              </Text>

              <Button
                title={i18n.t("profile.createProfile")}
                onPress={openModal}
                variant="outline"
              />
            </View>
          </Card>
        )}

        <Text style={styles.sectionTitle}>
          {i18n.t("profile.achievements")}
        </Text>

        {unlockedAchievements.length > 0 && (
          <>
            <Text style={styles.achievementSubtitle}>
              {i18n.t("profile.unlocked")}
            </Text>
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
                    <Image
                      source={
                        ACHIEVEMENT_ICONS[achievement.name] ??
                        PROFILE_ICONS.ACHIEVEMENT
                      }
                      style={{
                        width: 28,
                        height: 28,
                        tintColor: "#FBBF24",
                      }}
                      resizeMode="contain"
                    />
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
            <Text style={styles.achievementSubtitle}>
              {i18n.t("profile.locked")}
            </Text>
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
                    <Image
                      source={
                        ACHIEVEMENT_ICONS[achievement.name] ??
                        PROFILE_ICONS.ACHIEVEMENT
                      }
                      style={{
                        width: 28,
                        height: 28,
                        tintColor: "#888888",
                        opacity: 0.5,
                      }}
                      resizeMode="contain"
                    />
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
                  {profileData
                    ? i18n.t("profile.editProfile")
                    : i18n.t("profile.createProfile")}
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
                    label={i18n.t("profile.age")}
                    placeholder="25"
                    keyboardType="numeric"
                    value={form.age}
                    onChangeText={(v) => setForm({ ...form, age: v })}
                  />
                </View>
                <View style={styles.formHalf}>
                  <Input
                    label={`${i18n.t("profile.weight")} (${
                      form.unitSystem === "IMPERIAL" ? "lb" : "kg"
                    })`}
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
                    label={`${i18n.t("profile.height")} (${
                      form.unitSystem === "IMPERIAL" ? "in" : "cm"
                    })`}
                    placeholder="175"
                    keyboardType="decimal-pad"
                    value={form.height}
                    onChangeText={(v) => setForm({ ...form, height: v })}
                  />
                </View>
                <View style={styles.formHalf}>
                  <Text style={styles.fieldLabel}>
                    {i18n.t("profile.units")}
                  </Text>
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

              <Text style={styles.fieldLabel}>
                {i18n.t("profile.fitnessGoal")}
              </Text>

              <View style={styles.optionsGrid}>
                {GOALS.map((key) => (
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
                      {i18n.t(`profile.goals.${key}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>
                {i18n.t("profile.fitnessLevel")}
              </Text>

              <View style={styles.optionsGrid}>
                {LEVELS.map((key) => (
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
                      {i18n.t(`profile.levels.${key}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>
                {i18n.t("profile.trainingDays")}
              </Text>
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
                      {i18n.t(`profile.days.${day}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title={i18n.t("profile.saveProfile")}
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
        title={i18n.t("profile.logout")}
        message={i18n.t("profile.logoutConfirm")}
        type="warning"
        onClose={() => setLogoutAlertVisible(false)}
        confirmText={i18n.t("profile.logout")}
        onConfirm={logout}
        cancelText={i18n.t("common.cancel")}
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
    paddingTop: 20,
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
