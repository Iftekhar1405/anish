import { useEffect } from "react";
import { Redirect, Tabs, type Href } from "expo-router";
import { CalendarClock, ClipboardList, User } from "lucide-react-native";
import { useAuth } from "../../src/auth/AuthProvider";
import { registerForPushNotifications } from "../../src/notifications/registerPush";

export default function AppLayout() {
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authed") void registerForPushNotifications();
  }, [status]);

  if (status === "loading") return null;
  if (status !== "authed") return <Redirect href={"/login" as string as Href} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#15803D",
        tabBarInactiveTintColor: "#6B7280",
      }}
    >
      <Tabs.Screen
        name="assignments"
        options={{
          title: "Assignments",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => <CalendarClock color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="notifications" options={{ href: null, title: "Notifications" }} />
    </Tabs>
  );
}
