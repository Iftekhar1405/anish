import { Redirect, Tabs, type Href } from "expo-router";
import { LayoutDashboard, Users, Wrench } from "lucide-react-native";
import { useAuth } from "../../src/auth/AuthProvider";

export default function AppLayout() {
  const { status } = useAuth();
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
        name="dashboard"
        options={{
          title: "Dashboard",
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
    </Tabs>
  );
}
