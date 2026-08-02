import { Redirect, Stack, type Href } from "expo-router";
import { useAuth } from "../../src/auth/AuthProvider";

export default function AppLayout() {
  const { status } = useAuth();
  if (status === "loading") return null;
  if (status !== "authed") return <Redirect href={"/login" as string as Href} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
