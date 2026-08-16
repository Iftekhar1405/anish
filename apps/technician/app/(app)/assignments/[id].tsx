import { useState } from "react";
import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { errorMessage } from "@ai-platform/api-client";
import { Button, Card, EmptyState, formatDdMmYyyy, Input, KeyboardScreen, Spinner, useToast } from "@ai-platform/ui";
import type { BookingStatus } from "@ai-platform/types";
import {
  useAssignment,
  useCompleteBooking,
  useStartBooking,
} from "../../../src/features/bookings/hooks";

const STATUS_STYLE: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: "bg-secondary-100", text: "text-secondary-700", label: "Pending" },
  ASSIGNED: { bg: "bg-[#DBEAFE]", text: "text-[#1D4ED8]", label: "Assigned" },
  IN_PROGRESS: { bg: "bg-[#EDE9FE]", text: "text-[#6D28D9]", label: "In progress" },
  COMPLETED: { bg: "bg-primary-50", text: "text-primary-700", label: "Completed" },
  CANCELLED: { bg: "bg-neutral-100", text: "text-neutral-500", label: "Cancelled" },
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-3">
      <Text className="text-sm text-neutral-500">{label}</Text>
      <Text className="flex-1 text-right text-sm font-medium text-neutral-900">{value}</Text>
    </View>
  );
}

export default function AssignmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useAssignment(id);
  const start = useStartBooking();
  const complete = useCompleteBooking();
  const toast = useToast();
  const [serviceNotes, setServiceNotes] = useState("");

  if (query.isLoading) return <Spinner label="Loading assignment…" className="flex-1" />;
  if (query.isError || !query.data) {
    return (
      <EmptyState
        title="Couldn't load this assignment"
        description="It may not be assigned to you, or your connection dropped."
        actionLabel="Retry"
        onAction={() => query.refetch()}
      />
    );
  }

  const booking = query.data;
  const style = STATUS_STYLE[booking.status];

  async function onStart(): Promise<void> {
    try {
      await start.mutateAsync(id);
      toast.show("Service started", "success");
    } catch (err) {
      toast.show(
        errorMessage(err, "Couldn't start — check your connection and try again."),
        "error",
      );
    }
  }

  async function onComplete(): Promise<void> {
    try {
      await complete.mutateAsync({ id, serviceNotes: serviceNotes || undefined });
      toast.show("Service completed", "success");
    } catch (err) {
      toast.show(
        errorMessage(err, "Couldn't complete — check your connection and try again."),
        "error",
      );
    }
  }

  return (
    <KeyboardScreen className="bg-neutral-50" contentContainerClassName="gap-3 p-4">
      <Card className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-neutral-900">
            {booking.farmer?.name ?? "Farmer"}
          </Text>
          <View className={`rounded-full px-3 py-1 ${style.bg}`}>
            <Text className={`text-sm font-medium ${style.text}`}>{style.label}</Text>
          </View>
        </View>
        <Row label="Phone" value={booking.farmer?.phone ?? "—"} />
        <Row
          label="Visit location"
          value={
            booking.location ??
            ([booking.farmer?.address, booking.farmer?.district?.name]
              .filter(Boolean)
              .join(", ") ||
              "Not on file")
          }
        />
        <Row label="Animal" value={`${booking.animal?.tag ?? "—"} (${booking.animal?.species ?? "—"})`} />
        <Row label="Bull / Buck" value={booking.batch?.sire?.name ?? "—"} />
        <Row label="Preferred date" value={formatDdMmYyyy(booking.preferredDate)} />
        {booking.notes ? <Row label="Farmer notes" value={booking.notes} /> : null}
      </Card>

      {booking.status === "ASSIGNED" ? (
        <Button onPress={onStart} loading={start.isPending}>
          Start service
        </Button>
      ) : null}

      {booking.status === "IN_PROGRESS" ? (
        <Card className="gap-3">
          <Input
            label="Service notes (optional)"
            multiline
            placeholder="Insemination details, complications, follow-up…"
            value={serviceNotes}
            onChangeText={setServiceNotes}
          />
          <Button onPress={onComplete} loading={complete.isPending}>
            Complete service
          </Button>
        </Card>
      ) : null}

      {booking.status === "COMPLETED" ? (
        <Card className="gap-2">
          <Text className="text-sm font-medium text-neutral-700">Service notes</Text>
          <Text className="text-sm text-neutral-900">
            {booking.serviceNotes ?? "No notes recorded."}
          </Text>
        </Card>
      ) : null}
    </KeyboardScreen>
  );
}
