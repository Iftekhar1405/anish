import { ScrollView, Text, View } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { Card, EmptyState, Spinner, StatCard } from "@ai-platform/ui";
import { useInventoryReport } from "../../../src/features/reports/hooks";

export default function InventoryReportScreen() {
  const query = useInventoryReport();

  if (query.isLoading) return <Spinner label="Loading inventory report…" className="flex-1" />;
  if (query.isError || !query.data) {
    return (
      <EmptyState
        title="Couldn't load the inventory report"
        description="Check your connection and try again."
        actionLabel="Retry"
        onAction={() => query.refetch()}
      />
    );
  }

  const report = query.data;

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="gap-3 p-4">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <StatCard label="Batches" value={report.totalBatches} />
        </View>
        <View className="flex-1">
          <StatCard label="Straws available" value={report.totalQuantityAvailable} />
        </View>
        <View className="flex-1">
          <StatCard label="Straws used" value={report.totalQuantityUsed} />
        </View>
      </View>

      <Text className="mt-2 text-sm font-semibold uppercase text-neutral-500">By bull/buck</Text>
      {report.bySire.map((s) => {
        const pct = s.quantityTotal > 0 ? (s.quantityAvailable / s.quantityTotal) * 100 : 0;
        return (
          <Card key={s.sireId} className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-neutral-900">{s.sireName}</Text>
              <Text className="text-sm text-neutral-500">
                {s.quantityAvailable}/{s.quantityTotal}
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-neutral-100">
              <View className="h-2 rounded-full bg-primary-600" style={{ width: `${pct}%` }} />
            </View>
          </Card>
        );
      })}

      <Text className="mt-2 text-sm font-semibold uppercase text-neutral-500">Low stock</Text>
      {report.lowStock.length === 0 ? (
        <Text className="text-sm text-neutral-500">Nothing below the low-stock threshold.</Text>
      ) : (
        report.lowStock.map((b) => (
          <Card key={b.id} className="flex-row items-center gap-3">
            <AlertTriangle size={20} color="#D97706" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-neutral-900">{b.sireName}</Text>
              <Text className="text-xs text-neutral-500">{b.batchNumber}</Text>
            </View>
            <Text className="text-sm font-medium text-warning">
              {b.quantityAvailable}/{b.quantityTotal}
            </Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}
