import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { exercisesApi } from "../../lib/api/exercises";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import {
  MUSCLE_GROUP_COLORS,
  getMuscleGroupColor,
  getWorkoutColor,
} from "../../lib/constants/muscleGroups";

const MUSCLE_GROUP_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  CHEST: "body-outline",
  BACK: "body-outline",
  SHOULDERS: "body-outline",
  ARMS: "body-outline",
  LEGS: "body-outline",
  CORE: "body-outline",
  FULL_BODY: "body-outline",
};

const FILTERS = [
  "ALL",
  "CHEST",
  "BACK",
  "SHOULDERS",
  "ARMS",
  "LEGS",
  "CORE",
  "FULL_BODY",
];

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => exercisesApi.getAll(1, 100),
  });

  const filtered = (
    selectedFilter === "ALL"
      ? (data?.data ?? [])
      : (data?.data ?? []).filter((e: any) => e.muscleGroup === selectedFilter)
  ).filter(
    (e: any) =>
      search.length === 0 ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.equipment?.toLowerCase().includes(search.toLowerCase()),
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
      <View style={[styles.headerContainer, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Exercises</Text>
        <Text style={styles.subtitle}>
          {data?.meta?.total ?? 0} exercises available
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter === "ALL" ? "All" : filter.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color="#888888"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
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
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {filtered.length === 0 && (
          <Card>
            <View style={styles.emptyContainer}>
              <Ionicons name="body-outline" size={48} color="#2A2A2A" />
              <Text style={styles.emptyTitle}>No exercises found</Text>
              <Text style={styles.emptyText}>
                {selectedFilter === "ALL"
                  ? "No exercises in the catalog yet"
                  : `No ${selectedFilter.replace("_", " ").toLowerCase()} exercises yet`}
              </Text>
            </View>
          </Card>
        )}

        {filtered.map((exercise: any) => (
          <TouchableOpacity
            key={exercise.id}
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: "/exercise/[id]",
                params: {
                  id: exercise.id,
                  name: exercise.name,
                  muscleGroup: exercise.muscleGroup,
                  equipment: exercise.equipment ?? "",
                  description: exercise.description ?? "",
                },
              })
            }
          >
            <Card
              style={[
                styles.exerciseCard,
                {
                  borderLeftWidth: 4,
                  borderLeftColor: getMuscleGroupColor(exercise.muscleGroup),
                },
              ]}
            >
              <View style={styles.exerciseRow}>
                <View
                  style={[
                    styles.exerciseIcon,
                    {
                      backgroundColor: `${MUSCLE_GROUP_COLORS[exercise.muscleGroup]}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name="barbell-outline"
                    size={22}
                    color={
                      MUSCLE_GROUP_COLORS[exercise.muscleGroup] ?? "#888888"
                    }
                  />
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <View style={styles.exerciseMeta}>
                    <Badge
                      label={exercise.muscleGroup.replace("_", " ")}
                      variant="muted"
                    />
                    {exercise.equipment && (
                      <Text style={styles.equipment}>{exercise.equipment}</Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#2A2A2A" />
              </View>
              {exercise.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {exercise.description}
                </Text>
              )}
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  loading: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#888888",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    gap: 8,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
  },
  filtersContainer: {
    gap: 8,
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  filterChipActive: {
    backgroundColor: "rgba(0,255,135,0.1)",
    borderColor: "#00FF87",
  },
  filterText: {
    color: "#888888",
    fontSize: 13,
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#00FF87",
  },
  content: {
    padding: 20,
    paddingTop: 12,
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
  exerciseCard: {
    marginBottom: 12,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  exerciseIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  exerciseMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  equipment: {
    color: "#888888",
    fontSize: 12,
  },
  description: {
    color: "#888888",
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
  },
});
