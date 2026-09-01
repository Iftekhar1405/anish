import { useEffect } from "react";
import { Redirect, Tabs, type Href } from "expo-router";
import { CalendarClock, Milk, PawPrint, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/auth/AuthProvider";
import {
  configureNotificationDisplay,
  registerForPushNotifications,
} from "../../src/notifications/registerPush";

export default function AppLayout() {
  const { status } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (status !== "authed") return;
    void configureNotificationDisplay();
    void registerForPushNotifications();
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
        name="animals"
        options={{
          title: "My Animals",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <PawPrint color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="catalogue"
        options={{
          title: "Catalogue",
          tabBarIcon: ({ color, size }) => <Milk color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          headerShown: false,
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
