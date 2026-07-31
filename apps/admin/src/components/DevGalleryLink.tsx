import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";

/** Dev-only entry point into the design gallery; never rendered in production builds. */
export function DevGalleryLink() {
  const router = useRouter();
  if (!__DEV__) return null;

  return (
    <Pressable
      onPress={() => router.push("/design-gallery")}
      className="mt-8 rounded-md bg-neutral-100 px-4 py-2"
    >
      <Text className="text-sm font-medium text-neutral-700">View component gallery (dev only)</Text>
    </Pressable>
  );
}
