import { useState } from "react";
import { Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { errorMessage } from "@ai-platform/api-client";
import { Button, Dialog, Input, Select, Table, useToast } from "@ai-platform/ui";
import {
  breedLabel,
  farmerAnimalFormSchema,
  OTHER_BREED_VALUE,
  toBreedChoice,
  type Animal,
  type FarmerAnimalFormInput,
  type FarmerAnimalFormValues,
} from "@ai-platform/types";
import { useMyAnimals, useCreateMyAnimal, useUpdateMyAnimal } from "../../../src/features/animals/hooks";
import { useBreeds } from "../../../src/features/breeds/hooks";
import { useSpecies } from "../../../src/features/species/hooks";

const PAGE_SIZE = 10;

const EMPTY_FORM: FarmerAnimalFormInput = {
  speciesId: "",
  breedId: "",
  breedOther: "",
  tag: "",
  ageMonths: "",
};

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
    defaultValues: EMPTY_FORM,
  });

  const speciesId = form.watch("speciesId");
  const breedChoice = form.watch("breedId");
  const speciesQuery = useSpecies();
  const speciesOptions = (speciesQuery.data?.items ?? []).map((s) => ({
    label: s.name,
    value: s.id,
  }));
  // Without this the form just refuses to save with "Species is required" and
  // no hint that the list behind the dropdown never arrived.
  const speciesUnavailable = speciesQuery.isError
    ? "Couldn't load the species list — check your connection and try again."
    : speciesOptions.length === 0 && !speciesQuery.isLoading
      ? "No species available yet — ask your centre to add one."
      : null;
  const breedQuery = useBreeds(speciesId);
  // Farmers frequently don't know the registered breed — and the master list
  // may not carry theirs — so "Other" always sits at the bottom of the list.
  const breedOptions = [
    { label: "Not sure / none", value: "" },
    ...(breedQuery.data?.items ?? []).map((b) => ({ label: b.name, value: b.id })),
    { label: "Other — type it in", value: OTHER_BREED_VALUE },
  ];

  function openCreate(): void {
    form.reset(EMPTY_FORM);
    setCreating(true);
  }

  function openEdit(row: Animal): void {
    setEditing(row);
    form.reset({
      speciesId: row.speciesId,
      ...toBreedChoice(row),
      tag: row.tag,
      ageMonths: row.ageMonths != null ? String(row.ageMonths) : "",
    });
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          input: {
            breedId: values.breedId,
            breedOther: values.breedOther,
            tag: values.tag,
            ageMonths: values.ageMonths,
          },
        });
        toast.show("Animal updated", "success");
        setEditing(null);
      } else {
        await create.mutateAsync(values);
        toast.show("Animal added", "success");
        setCreating(false);
      }
    } catch (err) {
      toast.show(errorMessage(err, "Could not save animal"), "error");
    }
  });

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            placeholder="Search by tag / number / name"
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
          { key: "tag", header: "Tag / Number / Name", accessor: (r) => r.tag },
          { key: "species", header: "Species", accessor: (r) => r.species?.name },
          { key: "breed", header: "Breed", accessor: (r) => breedLabel(r) },
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
          {speciesUnavailable ? (
            <Text className="text-sm text-error">{speciesUnavailable}</Text>
          ) : null}
          <Controller
            control={form.control}
            name="speciesId"
            render={({ field }) => (
              <Select
                label="Species"
                placeholder={
                  speciesQuery.isLoading ? "Loading species…" : "Select a species"
                }
                value={field.value || null}
                options={speciesOptions}
                onChange={(v) => {
                  field.onChange(v);
                  form.setValue("breedId", "");
                  form.setValue("breedOther", "");
                }}
                disabled={editing !== null}
                emptyMessage={speciesUnavailable ?? "No species available."}
                error={form.formState.errors.speciesId?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="tag"
            render={({ field }) => (
              <Input
                label="Tag / Number / Name"
                placeholder="Ear tag, register number, or the animal's name"
                autoCapitalize="words"
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
                placeholder={
                  !speciesId
                    ? "Pick a species first"
                    : breedQuery.isLoading
                      ? "Loading breeds…"
                      : "Select a breed"
                }
                value={field.value || ""}
                options={breedOptions}
                onChange={field.onChange}
              />
            )}
          />
          {breedChoice === OTHER_BREED_VALUE ? (
            <Controller
              control={form.control}
              name="breedOther"
              render={({ field }) => (
                <Input
                  label="Breed name"
                  placeholder="Type the breed as you know it"
                  autoCapitalize="words"
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  error={form.formState.errors.breedOther?.message}
                />
              )}
            />
          ) : null}
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
