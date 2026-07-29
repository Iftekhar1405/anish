import { Pressable, Text, View } from "react-native";
import { useAuth } from "../../src/providers/AuthProvider";

export default function AdminHome() {
  const { user, logout } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-neutral-50 px-6">
      <Text className="text-3xl font-bold text-primary-700">AI Platform — Admin</Text>
      <Text className="mt-2 text-base text-neutral-500">
        Signed in as {user?.phone}. Dashboard, farmers, technicians, catalogue, inventory, and
        reports land in later phases.
      </Text>
      <Pressable
        onPress={() => void logout()}
        className="mt-8 rounded-md bg-neutral-100 px-6 py-3"
      >
        <Text className="text-base font-semibold text-neutral-900">Log out</Text>
      </Pressable>
    </View>
  );
}
