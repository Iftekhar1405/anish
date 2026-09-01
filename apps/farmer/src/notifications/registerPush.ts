import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { apiClient } from "../lib/api";

/** Matches the notification accent configured for this app in app.json. */
const ACCENT_COLOR = "#15803D";

/**
 * The channel every push is posted to. Android 8+ drops any notification whose
 * channel doesn't exist, and the channel — not the payload — owns importance,
 * sound and vibration. The server sets the same id on outgoing FCM messages.
 */
const CHANNEL_ID = "default";

/**
 * Expo Go removed remote push in SDK 53, and `expo-notifications` *throws at
 * module scope* the moment it's required there — which in dev surfaces a
 * LogBox overlay even when the import is wrapped in try/catch. So we must not
 * require the module at all in Expo Go; a dev/production build gets full push.
 *
 * Returns null whenever notifications aren't usable, so every caller degrades
 * to a no-op rather than throwing.
 */
async function loadNotifications(): Promise<typeof import("expo-notifications") | null> {
  if (Platform.OS === "web") return null;
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return null;
  try {
    // Imported lazily on purpose so nothing in this module's dependency graph is
    // evaluated until we've confirmed we're outside Expo Go.
    return await import("expo-notifications");
  } catch {
    return null;
  }
}

/**
 * Makes an arriving push visible.
 *
 * Without a handler, expo-notifications deliberately displays *nothing* while
 * the app is in the foreground — the notification still arrives and still lands
 * in the in-app inbox, but the user sees no banner, which is indistinguishable
 * from push being broken. Safe to call more than once; both calls are idempotent.
 */
export async function configureNotificationDisplay(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: "Booking updates",
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: ACCENT_COLOR,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  } catch {
    // Display configuration is best-effort — a failure here must never stop the
    // app from starting, and in-app notifications work without it.
  }
}

/**
 * Best-effort device push registration. Silently no-ops on web or when
 * permission/token retrieval isn't available (e.g. Expo Go, no physical
 * device) — the user can still use the app fully via the in-app inbox.
 */
export async function registerForPushNotifications(): Promise<void> {
  const Notifications = await loadNotifications();
  if (!Notifications) return;
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
