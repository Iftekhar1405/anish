import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { apiClient } from "../lib/api";

/**
 * Best-effort device push registration. Silently no-ops on web or when
 * permission/token retrieval isn't available (e.g. Expo Go, no physical
 * device) — a farmer can still use the app fully via the in-app inbox.
 */
export async function registerForPushNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
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
