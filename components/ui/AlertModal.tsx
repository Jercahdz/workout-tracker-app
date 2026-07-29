import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: "error" | "warning" | "success" | "info";
  onClose: () => void;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
}

export const AlertModal = ({
  visible,
  title,
  message,
  type = "info",
  onClose,
  confirmText,
  onConfirm,
  cancelText = "Close",
}: AlertModalProps) => {
  const iconConfig = {
    error: { name: "close-circle" as const, color: "#EF4444" },
    warning: { name: "warning" as const, color: "#FBBF24" },
    success: { name: "checkmark-circle" as const, color: "#00FF87" },
    info: { name: "information-circle" as const, color: "#60A5FA" },
  };

  const icon = iconConfig[type];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
            <Ionicons name={icon.name} size={40} color={icon.color} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttons}>
            {onConfirm && (
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmText}>{confirmText ?? "Confirm"}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, !onConfirm && styles.fullWidth]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    color: "#888888",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#00FF87",
  },
  cancelButton: {
    backgroundColor: "#2A2A2A",
  },
  fullWidth: {
    flex: 1,
  },
  confirmText: {
    color: "#0F0F0F",
    fontWeight: "bold",
    fontSize: 15,
  },
  cancelText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});