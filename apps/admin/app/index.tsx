import { Redirect, type Href } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../src/auth/AuthProvider";

export default function Index() {
  const { status } = useAuth();
  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }
  const target: string = status === "authed" ? "/dashboard" : "/login";
  return <Redirect href={target as Href} />;
}
