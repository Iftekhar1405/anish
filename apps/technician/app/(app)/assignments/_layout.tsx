import { Stack } from "expo-router";

export default function AssignmentsLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Assignments" }} />
      <Stack.Screen name="[id]" options={{ title: "Assignment" }} />
    </Stack>
  );
}
