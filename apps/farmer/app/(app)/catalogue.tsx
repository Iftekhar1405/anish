import { useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { Milk } from "lucide-react-native";
import { Card, EmptyState, Input, Select, Skeleton } from "@ai-platform/ui";
import type { Sire } from "@ai-platform/types";
import { useSires } from "../../src/features/catalogue/hooks";
import { useSpecies } from "../../src/features/species/hooks";

const PAGE_SIZE = 20;

function formatPrice(minor: number): string {
  return `₹${(minor / 100).toFixed(2)}`;
}

export default function CatalogueScreen() {
  const [search, setSearch] = useState("");
  const [speciesId, setSpeciesId] = useState<string>("");

  const speciesQuery = useSpecies();
  const speciesFilterOptions = [
    { label: "All species", value: "" },
    ...(speciesQuery.data?.items ?? []).map((s) => ({ label: s.name, value: s.id })),
  ];

  const query = useSires({
    pageSize: PAGE_SIZE,
    search: search || undefined,
    speciesId: speciesId || undefined,
  });

  const items = query.data?.items ?? [];

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <Input placeholder="Search bulls & bucks" value={search} onChangeText={setSearch} />
      <Select
        label="Species"
        value={speciesId}
        options={speciesFilterOptions}
        onChange={setSpeciesId}
      />

      {query.isLoading ? (
        <View className="gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </View>
      ) : query.isError ? (
        <EmptyState
          title="Couldn't load the catalogue"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => query.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Milk}
          title="No bulls or bucks found"
          description="Try a different search or species filter."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 pb-6"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => <SireCard sire={item} />}
        />
      )}
    </View>
  );
}

function SireCard({ sire }: { sire: Sire }) {
  return (
    <Card className="flex-row gap-3">
      {sire.imageUrl ? (
        <Image source={{ uri: sire.imageUrl }} className="h-16 w-16 rounded-lg bg-neutral-100" />
      ) : (
        <View className="h-16 w-16 items-center justify-center rounded-lg bg-neutral-100">
          <Milk size={24} color="#9CA3AF" />
        </View>
      )}
      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-neutral-900">{sire.name}</Text>
          <View
            className={
              sire.isAvailable ? "rounded-full bg-primary-50 px-2 py-0.5" : "rounded-full bg-neutral-100 px-2 py-0.5"
            }
          >
            <Text className={sire.isAvailable ? "text-xs font-medium text-primary-700" : "text-xs font-medium text-neutral-500"}>
              {sire.isAvailable ? "Available" : "Unavailable"}
            </Text>
          </View>
        </View>
        <Text className="text-sm text-neutral-500">
          {sire.species?.name} · {sire.breed?.name ?? "Unknown breed"}
        </Text>
        <Text className="text-sm font-medium text-neutral-900">
          {formatPrice(sire.strawPriceMinor)} per straw
        </Text>
      </View>
    </Card>
  );
}
