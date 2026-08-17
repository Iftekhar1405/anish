import { Stack } from "expo-router";

export default function MastersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: "#15803D",
        headerStyle: { backgroundColor: "#FFFFFF" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Master Data" }} />
      <Stack.Screen name="species" options={{ title: "Species" }} />
      <Stack.Screen name="breeds" options={{ title: "Breeds" }} />
      <Stack.Screen name="organizations" options={{ title: "Organizations" }} />
      <Stack.Screen name="districts" options={{ title: "Districts" }} />
      <Stack.Screen name="service-areas" options={{ title: "Service Areas" }} />
      <Stack.Screen name="catalogue" options={{ title: "Semen Catalogue" }} />
      <Stack.Screen name="batches" options={{ title: "Inventory / Batches" }} />
      <Stack.Screen name="animals" options={{ title: "Animals" }} />
    </Stack>
  );
}
