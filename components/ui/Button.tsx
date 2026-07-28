import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
}

export const Button = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#0F0F0F" : "#00FF87"}
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: "#00FF87",
  },
  secondary: {
    backgroundColor: "#1A1A1A",
  },
  outline: {
    borderWidth: 1,
    borderColor: "#00FF87",
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
  },
  primaryText: {
    color: "#0F0F0F",
    fontWeight: "bold",
  },
  secondaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  outlineText: {
    color: "#00FF87",
    fontWeight: "600",
  },
});
