import { ScrollView, Text, View } from "react-native";
import { UserCheck, Users, Wrench } from "lucide-react-native";
import { StatCard } from "@ai-platform/ui";
import { useAuth } from "../../src/auth/AuthProvider";
import { useFarmers, useTechnicians } from "../../src/features/users/hooks";

export default function DashboardScreen() {
  const { user } = useAuth();
  const farmers = useFarmers({ pageSize: 1 });
  const technicians = useTechnicians({ pageSize: 1 });
  const activeTechnicians = useTechnicians({ pageSize: 1, isActive: true });

  return (
    <ScrollView className="flex-1 bg-neutral-50">
      <View className="gap-3 p-4">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-neutral-900">
            Welcome, {user?.name}
          </Text>
          <Text className="text-sm text-neutral-500">Platform overview</Text>
        </View>

        <StatCard label="Farmers" value={farmers.data?.total ?? "—"} icon={Users} />
        <StatCard
          label="Technicians"
          value={technicians.data?.total ?? "—"}
          icon={Wrench}
        />
        <StatCard
          label="Active technicians"
          value={activeTechnicians.data?.total ?? "—"}
          icon={UserCheck}
        />
      </View>
    </ScrollView>
  );
}
