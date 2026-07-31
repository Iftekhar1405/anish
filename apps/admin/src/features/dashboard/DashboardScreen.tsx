import { ScrollView, Text, View } from "react-native";
import { Users, Wrench } from "lucide-react-native";
import { Skeleton, StatCard } from "@ai-platform/ui";
import { useAuth } from "../../providers/AuthProvider";
import { useFarmersQuery } from "../farmers/hooks";
import { useTechniciansQuery } from "../technicians/hooks";
import { DevGalleryLink } from "../../components/DevGalleryLink";

const COUNT_QUERY = { page: 1, pageSize: 1 };

export function DashboardScreen() {
  const { user } = useAuth();
  const farmers = useFarmersQuery(COUNT_QUERY);
  const technicians = useTechniciansQuery(COUNT_QUERY);

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="p-6">
      <Text className="mb-1 text-2xl font-bold text-neutral-900">Welcome back</Text>
      <Text className="mb-6 text-base text-neutral-500">Signed in as {user?.phone}.</Text>

      <View className="flex-row flex-wrap gap-4">
        {farmers.isLoading ? (
          <Skeleton className="h-24 w-56" />
        ) : (
          <StatCard label="Total Farmers" value={farmers.data?.total ?? 0} icon={Users} />
        )}
        {technicians.isLoading ? (
          <Skeleton className="h-24 w-56" />
        ) : (
          <StatCard label="Total Technicians" value={technicians.data?.total ?? 0} icon={Wrench} />
        )}
      </View>

      <Text className="mt-8 text-sm text-neutral-500">
        Catalogue, inventory, bookings, and reports land in later phases.
      </Text>

      <DevGalleryLink />
    </ScrollView>
  );
}
