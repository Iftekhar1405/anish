import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Card, EmptyState, Input, Spinner, StatCard } from "@ai-platform/ui";
import type { BookingStatus } from "@ai-platform/types";
import { useBookingsReport } from "../../../src/features/reports/hooks";

const STATUS_COLOR: Record<BookingStatus, string> = {
  PENDING: "bg-secondary-500",
  ASSIGNED: "bg-[#2563EB]",
  IN_PROGRESS: "bg-[#7C3AED]",
  COMPLETED: "bg-primary-600",
  CANCELLED: "bg-neutral-400",
};

export default function BookingReportScreen() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const query = useBookingsReport({ from: from || undefined, to: to || undefined });

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="gap-3 p-4">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            label="From (optional)"
            placeholder="2026-01-01"
            autoCapitalize="none"
            value={from}
            onChangeText={setFrom}
          />
        </View>
        <View className="flex-1">
          <Input
            label="To (optional)"
            placeholder="2026-12-31"
            autoCapitalize="none"
            value={to}
            onChangeText={setTo}
          />
        </View>
      </View>

      {query.isLoading ? (
        <Spinner label="Loading…" />
      ) : query.isError || !query.data ? (
        <EmptyState
          title="Couldn't load the booking report"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => query.refetch()}
        />
      ) : (
        <>
          <StatCard label="Total bookings" value={query.data.total} />
          {(Object.entries(query.data.byStatus) as [BookingStatus, number][]).map(
            ([status, count]) => {
              const pct = query.data!.total > 0 ? (count / query.data!.total) * 100 : 0;
              return (
                <Card key={status} className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-neutral-900">{status}</Text>
                    <Text className="text-sm text-neutral-500">{count}</Text>
                  </View>
                  <View className="h-2 overflow-hidden rounded-full bg-neutral-100">
                    <View
                      className={`h-2 rounded-full ${STATUS_COLOR[status]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </View>
                </Card>
              );
            },
          )}
        </>
      )}
    </ScrollView>
  );
}
