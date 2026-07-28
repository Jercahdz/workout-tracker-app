import { View, Text, TextInput, TextInputProps, StyleSheet } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, ...props }: InputProps) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#888888"
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: "#888888",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#FFFFFF",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#EF4444",
  },
  error: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 4,
  },
});