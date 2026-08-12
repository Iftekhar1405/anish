import { Stack } from "expo-router";

export default function AnimalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "My Animals" }} />
      <Stack.Screen name="[id]" options={{ title: "Breeding history" }} />
    </Stack>
  );
}
