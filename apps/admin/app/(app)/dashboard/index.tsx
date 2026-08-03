import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import {
  Boxes,
  CalendarClock,
  ChevronRight,
  Milk,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react-native";
import { Card, StatCard } from "@ai-platform/ui";
import { useAuth } from "../../../src/auth/AuthProvider";
import { useFarmers, useTechnicians } from "../../../src/features/users/hooks";

interface ReportLink {
  href: string;
  title: string;
  description: string;
  Icon: typeof Boxes;
}

const REPORTS: ReportLink[] = [
  {
    href: "/dashboard/inventory-report",
    title: "Inventory report",
    description: "Straw stock by bull/buck, low-stock alerts",
    Icon: Boxes,
  },
  {
    href: "/dashboard/booking-report",
    title: "Booking report",
    description: "Bookings by status, date-ranged",
    Icon: CalendarClock,
  },
  {
    href: "/dashboard/technician-report",
    title: "Technician performance",
    description: "Assigned, completed, completion time",
    Icon: Wrench,
  },
  {
    href: "/dashboard/conception-report",
    title: "Conception statistics",
    description: "Animals by breeding status",
    Icon: Milk,
  },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
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

        <Text className="mt-2 text-sm font-semibold uppercase text-neutral-500">
          Reports
        </Text>
        {REPORTS.map(({ href, title, description, Icon }) => (
          <Pressable key={href} onPress={() => router.push(href as Href)}>
            <Card className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-50">
                <Icon size={22} color="#15803D" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-neutral-900">{title}</Text>
                <Text className="text-sm text-neutral-500">{description}</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
