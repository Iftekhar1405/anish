import { useEffect } from "react";
import { Redirect, Tabs, type Href } from "expo-router";
import {
  Bell,
  CalendarClock,
  Database,
  LayoutDashboard,
  Settings,
  Users,
  Wrench,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/auth/AuthProvider";
import { registerForPushNotifications } from "../../src/notifications/registerPush";

export default function AppLayout() {
  const { status } = useAuth();
  const insets = useSafeAreaInsets();

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
        // Android draws apps edge-to-edge, so the bar has to make room for the
        // system navigation buttons itself or the labels end up underneath them.
        tabBarStyle: {
          height: 58 + insets.bottom,
          paddingTop: 4,
          paddingBottom: insets.bottom + 4,
        },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="farmers"
        options={{
          title: "Farmers",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="technicians"
        options={{
          title: "Technicians",
          tabBarIcon: ({ color, size }) => <Wrench color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size }) => <CalendarClock color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="masters"
        options={{
          title: "Masters",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Database color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
