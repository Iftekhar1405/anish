import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { CalendarClock, Plus } from "lucide-react-native";
import { Button, Card, EmptyState, Skeleton } from "@ai-platform/ui";
import type { Booking, BookingStatus } from "@ai-platform/types";
import { useMyBookings } from "../../../src/features/bookings/hooks";

const STATUS_STYLE: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-secondary-100", text: "text-secondary-700", label: "Pending" },
  ASSIGNED: { bg: "bg-[#DBEAFE]", text: "text-[#1D4ED8]", label: "Assigned" },
  IN_PROGRESS: { bg: "bg-[#EDE9FE]", text: "text-[#6D28D9]", label: "In progress" },
  COMPLETED: { bg: "bg-primary-50", text: "text-primary-700", label: "Completed" },
  CANCELLED: { bg: "bg-neutral-100", text: "text-neutral-500", label: "Cancelled" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BookingsScreen() {
  const router = useRouter();
  const query = useMyBookings({ pageSize: 50 });
  const items = query.data?.items ?? [];

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <Button onPress={() => router.push("/bookings/new" as Href)}>
        + New booking
      </Button>

      {query.isLoading ? (
        <View className="gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </View>
      ) : query.isError ? (
        <EmptyState
          title="Couldn't load your bookings"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => query.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No bookings yet"
          description="Book an AI service for one of your animals to see it here."
          actionLabel="New booking"
          onAction={() => router.push("/bookings/new" as Href)}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 pb-6"
          renderItem={({ item }) => <BookingCard booking={item} />}
        />
      )}
    </View>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const router = useRouter();
  const style = STATUS_STYLE[booking.status];
  return (
    <Pressable onPress={() => router.push(`/bookings/${booking.id}` as Href)}>
      <Card className="gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-neutral-900">
            {booking.animal?.tag ?? "Animal"}
          </Text>
          <View className={`rounded-full px-2 py-0.5 ${style.bg}`}>
            <Text className={`text-xs font-medium ${style.text}`}>{style.label}</Text>
          </View>
        </View>
        <Text className="text-sm text-neutral-500">
          {booking.batch?.sire?.name ?? "Straw"} · Preferred {formatDate(booking.preferredDate)}
        </Text>
        {booking.technician ? (
          <Text className="text-sm text-neutral-500">Technician: {booking.technician.name}</Text>
        ) : null}
      </Card>
    </Pressable>
  );
}
