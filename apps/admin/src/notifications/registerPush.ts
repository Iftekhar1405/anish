import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { apiClient } from "../lib/api";

/**
 * Best-effort device push registration. Silently no-ops on web or when
 * permission/token retrieval isn't available (e.g. Expo Go, no physical
 * device) — a farmer can still use the app fully via the in-app inbox.
 */
export async function registerForPushNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  // Expo Go removed remote push in SDK 53, and `expo-notifications` *throws at
  // module scope* the moment it's required there — which in dev surfaces a
  // LogBox overlay even when the import is wrapped in try/catch. So we must not
  // require the module at all in Expo Go; a dev/production build gets full push.
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return;
  try {
    // Imported lazily on purpose so nothing in this module's dependency graph is
    // evaluated until we've confirmed we're outside Expo Go.
    const Notifications = await import("expo-notifications");
    const settings = await Notifications.getPermissionsAsync();
    let status = settings.status;
    if (status !== "granted") {
      const request = await Notifications.requestPermissionsAsync();
      status = request.status;
    }
    if (status !== "granted") return;
    const { data: token } = await Notifications.getDevicePushTokenAsync();
    await apiClient.post("/notifications/device-token", { token });
  } catch {
    // No device/build push support available — safe to ignore.
  }
}
