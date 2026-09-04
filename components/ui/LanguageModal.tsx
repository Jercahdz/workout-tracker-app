import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../../lib/i18n";
import { AppLocale } from "../../store/languageStore";

interface LanguageOption {
  code: AppLocale;
  label: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

interface LanguageModalProps {
  visible: boolean;
  currentLocale: AppLocale;
  onSelect: (locale: AppLocale) => void;
  onClose: () => void;
}

export function LanguageModal({
  visible,
  currentLocale,
  onSelect,
  onClose,
}: LanguageModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{i18n.t("profile.language")}</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color="#888888" />
            </TouchableOpacity>
          </View>

          {LANGUAGE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.code}
              style={styles.option}
              onPress={() => onSelect(option.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
              {currentLocale === option.code && (
                <Ionicons name="checkmark" size={20} color="#00FF87" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "85%",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  optionLabel: { color: "#FFFFFF", fontSize: 15, fontWeight: "500" },
});
