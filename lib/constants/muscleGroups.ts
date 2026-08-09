export const MUSCLE_GROUP_COLORS: Record<string, string> = {
  CHEST: "#EF4444",
  BACK: "#3B82F6",
  SHOULDERS: "#8B5CF6",
  ARMS: "#F59E0B",
  LEGS: "#10B981",
  CORE: "#F97316",
  FULL_BODY: "#00FF87",
};

export const getMuscleGroupColor = (muscleGroup: string): string => {
  return MUSCLE_GROUP_COLORS[muscleGroup?.toUpperCase()] ?? "#00FF87";
};

export const getWorkoutColor = (workout: any): string => {
  const firstExercise = workout.workoutExercises?.[0];
  if (!firstExercise?.exercise?.muscleGroup) return "#00FF87";
  return getMuscleGroupColor(firstExercise.exercise.muscleGroup);
};