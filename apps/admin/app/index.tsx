import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const APP_NAME = "Admin";
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

type Health = { status: string; database: string };
type State =
  | { kind: "loading" }
  | { kind: "ok"; data: Health }
  | { kind: "error"; message: string };

export default function HomeScreen() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/health`)
      .then((res) => res.json() as Promise<Health>)
      .then((data) => {
        if (active) setState({ kind: "ok", data });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            kind: "error",
            message: err instanceof Error ? err.message : String(err),
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <View className="flex-1 items-center justify-center gap-3 bg-white p-6">
      <Text className="text-2xl font-semibold text-neutral-900">
        AI Platform — {APP_NAME}
      </Text>
      <Text className="text-sm text-neutral-500">Phase 1 · Foundation</Text>

      {state.kind === "loading" && <ActivityIndicator />}
      {state.kind === "ok" && (
        <Text className="text-base text-success">
          API {state.data.status} · DB {state.data.database}
        </Text>
      )}
      {state.kind === "error" && (
        <Text className="text-base text-error">
          API unreachable — {state.message}
        </Text>
      )}
    </View>
  );
}
