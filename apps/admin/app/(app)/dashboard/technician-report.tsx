import { useState } from "react";
import { View } from "react-native";
import { Input, Table } from "@ai-platform/ui";
import type { TechnicianPerformanceEntry } from "@ai-platform/types";
import { useTechnicianPerformance } from "../../../src/features/reports/hooks";

function formatHours(hours: number | null): string {
  if (hours == null) return "—";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
}

export default function TechnicianReportScreen() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const query = useTechnicianPerformance({ from: from || undefined, to: to || undefined });

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
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

      <Table<TechnicianPerformanceEntry>
        columns={[
          { key: "name", header: "Technician", accessor: (r) => r.name },
          { key: "assigned", header: "Assigned", align: "right", accessor: (r) => r.assigned },
          { key: "completed", header: "Completed", align: "right", accessor: (r) => r.completed },
          {
            key: "rate",
            header: "Completion rate",
            align: "right",
            accessor: (r) => `${Math.round(r.completionRate * 100)}%`,
          },
          {
            key: "avg",
            header: "Avg. time",
            hideOnMobile: true,
            align: "right",
            accessor: (r) => formatHours(r.avgCompletionHours),
          },
        ]}
        data={query.data ?? []}
        keyExtractor={(r) => r.technicianId}
        loading={query.isLoading}
        error={query.isError ? "Couldn't load technician performance." : undefined}
        onRetry={() => query.refetch()}
        emptyTitle="No assignments in this range"
        emptyDescription="Once bookings are assigned to technicians, their performance shows up here."
      />
    </View>
  );
}
