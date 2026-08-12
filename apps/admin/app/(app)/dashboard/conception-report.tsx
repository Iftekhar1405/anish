import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Card, EmptyState, Select, Spinner, StatCard } from "@ai-platform/ui";
import { SPECIES, type AnimalBreedingStatus } from "@ai-platform/types";
import { useConceptionReport } from "../../../src/features/reports/hooks";

const speciesFilterOptions = [
  { label: "All species", value: "" },
  ...SPECIES.map((s) => ({ label: s, value: s })),
];

const STATUS_COLOR: Record<AnimalBreedingStatus, string> = {
  OPEN: "bg-neutral-400",
  INSEMINATED: "bg-secondary-500",
  PREGNANT: "bg-[#7C3AED]",
  CALVED: "bg-primary-600",
};

export default function ConceptionReportScreen() {
  const [species, setSpecies] = useState("");
  const query = useConceptionReport({
    species: species ? (species as (typeof SPECIES)[number]) : undefined,
  });

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="gap-3 p-4">
      <Select
        label="Species"
        value={species}
        options={speciesFilterOptions}
        onChange={setSpecies}
      />

      {query.isLoading ? (
        <Spinner label="Loading…" />
      ) : query.isError || !query.data ? (
        <EmptyState
          title="Couldn't load the conception report"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => query.refetch()}
        />
      ) : (
        <>
          <StatCard label="Total animals" value={query.data.total} />
          {(Object.entries(query.data.byStatus) as [AnimalBreedingStatus, number][]).map(
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
