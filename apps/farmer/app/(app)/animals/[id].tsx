import { FlatList, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Milk } from "lucide-react-native";
import { Card, EmptyState, formatDdMmYyyy, Spinner } from "@ai-platform/ui";
import { breedLabel, type BreedingHistoryEntry } from "@ai-platform/types";
import { useAnimal, useBreedingHistory } from "../../../src/features/animals/hooks";

export default function AnimalHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const animalQuery = useAnimal(id);
  const historyQuery = useBreedingHistory(id);

  if (animalQuery.isLoading || historyQuery.isLoading) {
    return <Spinner label="Loading…" className="flex-1" />;
  }
  if (animalQuery.isError || !animalQuery.data) {
    return (
      <EmptyState
        title="Couldn't load this animal"
        description="It may not belong to you, or your connection dropped."
        actionLabel="Retry"
        onAction={() => animalQuery.refetch()}
      />
    );
  }

  const animal = animalQuery.data;
  const entries = historyQuery.data ?? [];

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <Card className="gap-1">
        <Text className="text-lg font-semibold text-neutral-900">{animal.tag}</Text>
        <Text className="text-sm text-neutral-500">
          {animal.species?.name} · {breedLabel(animal)} · {animal.breedingStatus}
        </Text>
      </Card>

      {entries.length === 0 ? (
        <EmptyState
          icon={Milk}
          title="No breeding history yet"
          description="Completed AI services for this animal will show up here."
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-2 pb-6"
          renderItem={({ item }) => <HistoryRow entry={item} />}
        />
      )}
    </View>
  );
}

function HistoryRow({ entry }: { entry: BreedingHistoryEntry }) {
  return (
    <Card className="gap-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-neutral-900">
          {entry.booking?.batch?.sire?.name ?? "Bull/Buck"}
        </Text>
        <Text className="text-xs text-neutral-400">{formatDdMmYyyy(entry.inseminationDate)}</Text>
      </View>
      {entry.notes ? <Text className="text-sm text-neutral-500">{entry.notes}</Text> : null}
    </Card>
  );
}
