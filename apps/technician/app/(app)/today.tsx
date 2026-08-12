import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { CalendarClock } from "lucide-react-native";
import { Card, EmptyState, Skeleton } from "@ai-platform/ui";
import type { Booking } from "@ai-platform/types";
import { useAssignments } from "../../src/features/bookings/hooks";

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function TodayScreen() {
  const query = useAssignments({ pageSize: 100 });
  const items = (query.data?.items ?? []).filter(
    (b) => isToday(b.preferredDate) && b.status !== "CANCELLED",
  );

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      {query.isLoading ? (
        <View className="gap-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </View>
      ) : query.isError ? (
        <EmptyState
          title="Couldn't load today's schedule"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => query.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Nothing scheduled for today"
          description="Bookings with today's preferred date will show up here."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 pb-6"
          renderItem={({ item }) => <ScheduleCard booking={item} />}
        />
      )}
    </View>
  );
}

function ScheduleCard({ booking }: { booking: Booking }) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push(`/assignments/${booking.id}` as Href)}>
      <Card className="gap-1">
        <Text className="text-base font-semibold text-neutral-900">
          {booking.farmer?.name ?? "Farmer"}
        </Text>
        <Text className="text-sm text-neutral-500">
          {booking.animal?.tag ?? "Animal"} · {booking.batch?.sire?.name ?? "Straw"}
        </Text>
        <Text className="text-sm text-neutral-500">{booking.status}</Text>
      </Card>
    </Pressable>
  );
}
