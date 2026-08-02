import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useAuth } from "../../src/auth/AuthProvider";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

type Health = { status: string; database: string };

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [health, setHealth] = useState("checking…");

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/health`)
      .then((res) => res.json() as Promise<Health>)
      .then((data) => {
        if (active) setHealth(`API ${data.status} · DB ${data.database}`);
      })
      .catch(() => {
        if (active) setHealth("API unreachable");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <View className="flex-1 justify-center gap-2 bg-white p-6">
      <Text className="text-2xl font-semibold text-neutral-900">
        Welcome, {user?.name}
      </Text>
      <Text className="text-sm text-neutral-500">Admin · {user?.phone}</Text>
      <Text className="text-sm text-neutral-500">{health}</Text>

      <Pressable
        className="mt-6 items-center rounded-md border border-neutral-300 py-3"
        onPress={() => {
          void logout();
        }}
      >
        <Text className="text-base font-medium text-neutral-900">Log out</Text>
      </Pressable>
    </View>
  );
}
