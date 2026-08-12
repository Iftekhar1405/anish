import { Stack } from "expo-router";

export default function BookingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Bookings" }} />
      <Stack.Screen name="new" options={{ title: "New booking" }} />
      <Stack.Screen name="[id]" options={{ title: "Booking" }} />
    </Stack>
  );
}
