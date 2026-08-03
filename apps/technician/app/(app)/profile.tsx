import { Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { Button, Card } from "@ai-platform/ui";
import { useAuth } from "../../src/auth/AuthProvider";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <View className="flex-1 gap-4 bg-neutral-50 p-4">
      <Card className="gap-1">
        <Text className="text-lg font-semibold text-neutral-900">{user?.name}</Text>
        <Text className="text-sm text-neutral-500">{user?.phone}</Text>
        <Text className="text-sm text-neutral-500">Technician account</Text>
      </Card>

      <Button variant="outline" onPress={() => router.push("/notifications" as Href)}>
        Notifications
      </Button>

      <Button
        variant="outline"
        onPress={() => {
          void logout();
        }}
      >
        Log out
      </Button>
    </View>
  );
}
