import { View, Text } from "react-native";

export default function ProgressScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#0F0F0F", justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "#00FF87", fontSize: 24 }}>Progress</Text>
    </View>
  );
}