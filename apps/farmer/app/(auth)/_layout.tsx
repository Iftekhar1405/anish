import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../src/providers/AuthProvider";

export default function AuthLayout() {
  const { status } = useAuth();
  if (status === "authenticated") return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
