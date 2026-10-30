import React from "react";
import { Tabs } from "expo-router";
import { BottomTabBar } from "@/components/navigation/BottomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="index"
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
      <Tabs.Screen name="analytics" options={{ title: "Tracker" }} />
      <Tabs.Screen name="ai-chat" options={{ title: "Articles" }} />
      <Tabs.Screen name="profile" options={{ title: "Account" }} />
    </Tabs>
  );
}
