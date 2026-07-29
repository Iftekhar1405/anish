import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../src/providers/AuthProvider";

export default function AppLayout() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator color="#15803D" />
      </View>
    );
  }

  if (status === "unauthenticated") return <Redirect href="/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
