import { View, Text, StyleSheet } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "primary" | "success" | "warning" | "error" | "muted";
}

export const Badge = ({ label, variant = "primary" }: BadgeProps) => {
  return (
    <View style={[styles.base, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  primary: { backgroundColor: "rgba(0,255,135,0.1)", borderColor: "rgba(0,255,135,0.3)" },
  success: { backgroundColor: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.3)" },
  warning: { backgroundColor: "rgba(234,179,8,0.1)", borderColor: "rgba(234,179,8,0.3)" },
  error: { backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)" },
  muted: { backgroundColor: "#1A1A1A", borderColor: "#2A2A2A" },
  text: { fontSize: 12, fontWeight: "600" },
  primaryText: { color: "#00FF87" },
  successText: { color: "#4ADE80" },
  warningText: { color: "#FBBF24" },
  errorText: { color: "#F87171" },
  mutedText: { color: "#888888" },
});