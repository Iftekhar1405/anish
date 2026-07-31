import { Redirect, Stack, usePathname, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Home, LogOut, Users, Wrench } from "lucide-react-native";
import { Sidebar, TopBar, type NavItemConfig } from "@ai-platform/ui";
import { useAuth } from "../../src/providers/AuthProvider";

const NAV_ITEMS: NavItemConfig[] = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "farmers", label: "Farmers", icon: Users },
  { key: "technicians", label: "Technicians", icon: Wrench },
];

const TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  farmers: "Farmers",
  technicians: "Technicians",
};

function activeKeyForPath(pathname: string): string {
  if (pathname.startsWith("/farmers")) return "farmers";
  if (pathname.startsWith("/technicians")) return "technicians";
  return "dashboard";
}

export default function AppLayout() {
  const { status, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator color="#15803D" />
      </View>
    );
  }

  if (status === "unauthenticated") return <Redirect href="/login" />;

  const activeKey = activeKeyForPath(pathname);

  function handleSelect(key: string): void {
    if (key === "farmers") {
      router.push("/farmers");
      return;
    }
    if (key === "technicians") {
      router.push("/technicians");
      return;
    }
    router.push("/");
  }

  return (
    <View className="flex-1 flex-row bg-neutral-50">
      <Sidebar items={NAV_ITEMS} activeKey={activeKey} onSelect={handleSelect} />
      <View className="flex-1">
        <TopBar
          title={TITLES[activeKey]}
          actions={
            <Pressable
              onPress={() => void logout()}
              className="flex-row items-center gap-2 px-2 py-1"
            >
              <LogOut size={18} color="#374151" />
              <Text className="text-sm font-medium text-neutral-700">Log out</Text>
            </Pressable>
          }
        />
        <View className="flex-1">
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </View>
    </View>
  );
}
