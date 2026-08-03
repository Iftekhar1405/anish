import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Dashboard" }} />
      <Stack.Screen name="inventory-report" options={{ title: "Inventory report" }} />
      <Stack.Screen name="booking-report" options={{ title: "Booking report" }} />
      <Stack.Screen name="technician-report" options={{ title: "Technician performance" }} />
      <Stack.Screen name="conception-report" options={{ title: "Conception report" }} />
    </Stack>
  );
}
