import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Card, EmptyState, formatDdMmYyyy, Spinner } from "@ai-platform/ui";
import type { BookingStatus } from "@ai-platform/types";
import { useBooking } from "../../../src/features/bookings/hooks";

const STATUS_STYLE: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-secondary-100", text: "text-secondary-700", label: "Pending" },
  ASSIGNED: { bg: "bg-[#DBEAFE]", text: "text-[#1D4ED8]", label: "Assigned" },
  IN_PROGRESS: { bg: "bg-[#EDE9FE]", text: "text-[#6D28D9]", label: "In progress" },
  COMPLETED: { bg: "bg-primary-50", text: "text-primary-700", label: "Completed" },
  CANCELLED: { bg: "bg-neutral-100", text: "text-neutral-500", label: "Cancelled" },
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-sm text-neutral-500">{label}</Text>
      <Text className="text-sm font-medium text-neutral-900">{value}</Text>
    </View>
  );
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useBooking(id);

  if (query.isLoading) return <Spinner label="Loading booking…" className="flex-1" />;
  if (query.isError || !query.data) {
    return (
      <EmptyState
        title="Couldn't load this booking"
        description="It may have been removed, or you don't have access to it."
        actionLabel="Retry"
        onAction={() => query.refetch()}
      />
    );
  }

  const booking = query.data;
  const style = STATUS_STYLE[booking.status];

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="gap-3 p-4">
      <Card className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-neutral-900">
            {booking.animal?.tag ?? "Animal"}
          </Text>
          <View className={`rounded-full px-3 py-1 ${style.bg}`}>
            <Text className={`text-sm font-medium ${style.text}`}>{style.label}</Text>
          </View>
        </View>
        <Row label="Bull / Buck" value={booking.batch?.sire?.name ?? "—"} />
        <Row label="Species" value={booking.animal?.species ?? "—"} />
        <Row label="Preferred date" value={formatDdMmYyyy(booking.preferredDate)} />
        <Row label="Location" value={booking.location ?? "Your profile address"} />
        <Row label="Technician" value={booking.technician?.name ?? "Not yet assigned"} />
        {booking.notes ? <Row label="Notes" value={booking.notes} /> : null}
      </Card>
    </ScrollView>
  );
}
