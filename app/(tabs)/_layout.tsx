import { Tabs } from "expo-router";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "../../lib/i18n";

const TAB_ICONS: Record<string, any> = {
  DASHBOARD: require("../../assets/icons/app_home.png"),
  WORKOUTS: require("../../assets/icons/app_workouts.png"),
  EXERCISES: require("../../assets/icons/app_exercises.png"),
  PROGRESS: require("../../assets/icons/app_progress.png"),
  PROFILE: require("../../assets/icons/app_profile.png"),
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0F0F0F",
          borderTopColor: "#2A2A2A",
          borderTopWidth: 1,
          paddingTop: 8,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: "#00FF87",
        tabBarInactiveTintColor: "#888888",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t("tabs.home"),
          tabBarIcon: ({ color, size }) => (
            <Image
              source={TAB_ICONS.DASHBOARD}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: i18n.t("tabs.workouts"),
          tabBarIcon: ({ color, size }) => (
            <Image
              source={TAB_ICONS.WORKOUTS}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: i18n.t("tabs.exercises"),
          tabBarIcon: ({ color, size }) => (
            <Image
              source={TAB_ICONS.EXERCISES}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: i18n.t("tabs.progress"),
          tabBarIcon: ({ color, size }) => (
            <Image
              source={TAB_ICONS.PROGRESS}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: i18n.t("tabs.profile"),
          tabBarIcon: ({ color, size }) => (
            <Image
              source={TAB_ICONS.PROFILE}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
