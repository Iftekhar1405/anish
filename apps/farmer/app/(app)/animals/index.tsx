import { useState } from "react";
import { View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ApiError } from "@ai-platform/api-client";
import { Button, Dialog, Input, Select, Table, useToast } from "@ai-platform/ui";
import {
  farmerAnimalFormSchema,
  SPECIES,
  type Animal,
  type FarmerAnimalFormInput,
  type FarmerAnimalFormValues,
} from "@ai-platform/types";
import { useMyAnimals, useCreateMyAnimal, useUpdateMyAnimal } from "../../../src/features/animals/hooks";
import { useBreeds } from "../../../src/features/breeds/hooks";

const PAGE_SIZE = 10;
const speciesOptions = SPECIES.map((s) => ({ label: s, value: s }));

export default function AnimalsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Animal | null>(null);
  const toast = useToast();

  const query = useMyAnimals({ page, pageSize: PAGE_SIZE, search: search || undefined });
  const create = useCreateMyAnimal();
  const update = useUpdateMyAnimal();

  const form = useForm<FarmerAnimalFormInput, unknown, FarmerAnimalFormValues>({
    resolver: zodResolver(farmerAnimalFormSchema),
    defaultValues: { species: "CATTLE", breedId: "", tag: "", ageMonths: "" },
  });

  const species = form.watch("species");
  const breedQuery = useBreeds(species);
  const breedOptions = [
    { label: "None", value: "" },
    ...(breedQuery.data?.items ?? []).map((b) => ({ label: b.name, value: b.id })),
  ];

  function openCreate(): void {
    form.reset({ species: "CATTLE", breedId: "", tag: "", ageMonths: "" });
    setCreating(true);
  }

  function openEdit(row: Animal): void {
    setEditing(row);
    form.reset({
      species: row.species,
      breedId: row.breedId ?? "",
      tag: row.tag,
      ageMonths: row.ageMonths != null ? String(row.ageMonths) : "",
    });
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          input: { breedId: values.breedId, tag: values.tag, ageMonths: values.ageMonths },
        });
        toast.show("Animal updated", "success");
        setEditing(null);
      } else {
        await create.mutateAsync(values);
        toast.show("Animal added", "success");
        setCreating(false);
      }
    } catch (err) {
      toast.show(
        err instanceof ApiError ? err.message : "Could not save animal",
        "error",
      );
    }
  });

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            placeholder="Search by tag"
            value={search}
            onChangeText={(t) => {
              setSearch(t);
              setPage(1);
            }}
          />
        </View>
        <Button size="sm" onPress={openCreate}>
          Add
        </Button>
      </View>

      <Table<Animal>
        columns={[
          { key: "tag", header: "Tag", accessor: (r) => r.tag },
          { key: "species", header: "Species", accessor: (r) => r.species },
          { key: "breed", header: "Breed", accessor: (r) => r.breed?.name },
          { key: "status", header: "Status", accessor: (r) => r.breedingStatus },
        ]}
        data={query.data?.items ?? []}
        keyExtractor={(r) => r.id}
        loading={query.isLoading}
        error={query.isError ? "Couldn't load your animals." : undefined}
        onRetry={() => query.refetch()}
        emptyTitle="No animals yet"
        emptyDescription="Add your cattle or goats to start booking AI services."
        page={page}
        pageCount={query.data?.pageCount ?? 1}
        onPageChange={setPage}
        actionsColumnWidth={220}
        renderActions={(r) => (
          <View className="flex-row gap-2">
            <Button size="sm" variant="outline" onPress={() => router.push(`/animals/${r.id}` as Href)}>
              History
            </Button>
            <Button size="sm" variant="outline" onPress={() => openEdit(r)}>
              Edit
            </Button>
          </View>
        )}
      />

      <Dialog
        visible={creating || editing !== null}
        title={editing ? "Edit animal" : "Add animal"}
        confirmLabel={editing ? "Save" : "Add"}
        loading={create.isPending || update.isPending}
        onConfirm={onSubmit}
        onCancel={() => {
          setCreating(false);
          setEditing(null);
        }}
      >
        <View className="gap-3">
          <Controller
            control={form.control}
            name="species"
            render={({ field }) => (
              <Select
                label="Species"
                value={field.value}
                options={speciesOptions}
                onChange={(v) => {
                  field.onChange(v);
                  form.setValue("breedId", "");
                }}
                disabled={editing !== null}
                error={form.formState.errors.species?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="tag"
            render={({ field }) => (
              <Input
                label="Tag / ear number"
                autoCapitalize="characters"
                value={field.value}
                onChangeText={field.onChange}
                error={form.formState.errors.tag?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="breedId"
            render={({ field }) => (
              <Select
                label="Breed (optional)"
                placeholder={breedQuery.isLoading ? "Loading breeds…" : "Select a breed"}
                value={field.value || ""}
                options={breedOptions}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={form.control}
            name="ageMonths"
            render={({ field }) => (
              <Input
                label="Age in months (optional)"
                keyboardType="number-pad"
                value={field.value ?? ""}
                onChangeText={field.onChange}
                error={form.formState.errors.ageMonths?.message}
              />
            )}
          />
        </View>
      </Dialog>
    </View>
  );
}
