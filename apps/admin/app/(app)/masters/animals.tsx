import { useState } from "react";
import { View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { errorMessage } from "@ai-platform/api-client";
import { Button, Dialog, Input, Select, Table, useToast } from "@ai-platform/ui";
import {
  ANIMAL_BREEDING_STATUSES,
  animalFormSchema,
  breedLabel,
  OTHER_BREED_VALUE,
  toBreedChoice,
  type Animal,
  type AnimalFormInput,
  type AnimalFormValues,
} from "@ai-platform/types";
import { animals, breeds, species } from "../../../src/features/masters/hooks";
import { useFarmers } from "../../../src/features/users/hooks";

const PAGE_SIZE = 10;
const statusOptions = ANIMAL_BREEDING_STATUSES.map((s) => ({ label: s, value: s }));

const EMPTY_FORM: AnimalFormInput = {
  farmerId: "",
  speciesId: "",
  breedId: "",
  breedOther: "",
  tag: "",
  ageMonths: "",
  breedingStatus: "OPEN",
};

export default function AnimalsScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Animal | null>(null);
  const [activeFlag, setActiveFlag] = useState(true);
  const toast = useToast();

  const query = animals.useList({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });
  const farmerQuery = useFarmers({ pageSize: 100 });
  const breedQuery = breeds.useList({ pageSize: 100 });
  const speciesQuery = species.useList({ pageSize: 100, isActive: true });
  const speciesOptions = (speciesQuery.data?.items ?? []).map((s) => ({
    label: s.name,
    value: s.id,
  }));
  const create = animals.useCreate();
  const update = animals.useUpdate();

  const farmerOptions = (farmerQuery.data?.items ?? []).map((f) => ({
    label: `${f.name} (${f.phone})`,
    value: f.id,
  }));

  const form = useForm<AnimalFormInput, unknown, AnimalFormValues>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const speciesId = form.watch("speciesId");
  const breedChoice = form.watch("breedId");
  // Farmers often don't know the registered breed, and the master list won't
  // cover every local one — "Other" reveals a free-text field.
  const breedOptions = [
    { label: "Not sure / none", value: "" },
    ...(breedQuery.data?.items ?? [])
      .filter((b) => b.speciesId === speciesId)
      .map((b) => ({ label: b.name, value: b.id })),
    { label: "Other — type it in", value: OTHER_BREED_VALUE },
  ];

  function openCreate(): void {
    form.reset(EMPTY_FORM);
    setCreating(true);
  }

  function openEdit(row: Animal): void {
    setEditing(row);
    setActiveFlag(row.isActive);
    form.reset({
      farmerId: row.farmerId,
      speciesId: row.speciesId,
      ...toBreedChoice(row),
      tag: row.tag,
      ageMonths: row.ageMonths != null ? String(row.ageMonths) : "",
      breedingStatus: row.breedingStatus,
    });
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          input: {
            speciesId: values.speciesId,
            breedId: values.breedId,
            breedOther: values.breedOther,
            tag: values.tag,
            ageMonths: values.ageMonths,
            breedingStatus: values.breedingStatus,
            isActive: activeFlag,
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
          { key: "breed", header: "Breed", hideOnMobile: true, accessor: (r) => breedLabel(r) },
          { key: "farmer", header: "Farmer", hideOnMobile: true, accessor: (r) => r.farmer?.name },
          {
            key: "status",
            header: "Status",
            accessor: (r) => r.breedingStatus,
          },
        ]}
        data={query.data?.items ?? []}
        keyExtractor={(r) => r.id}
        loading={query.isLoading}
        error={query.isError ? "Couldn't load animals." : undefined}
        onRetry={() => query.refetch()}
        emptyTitle="No animals yet"
        emptyDescription="Animals appear here as farmers register them."
        page={page}
        pageCount={query.data?.pageCount ?? 1}
        onPageChange={setPage}
        renderActions={(r) => (
          <Button size="sm" variant="outline" onPress={() => openEdit(r)}>
            Edit
          </Button>
        )}
      />

      <Dialog
        visible={creating || editing !== null}
        title={editing ? "Edit animal" : "Add animal"}
        confirmLabel={editing ? "Save" : "Create"}
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
            name="farmerId"
            render={({ field }) => (
              <Select
                label="Farmer (owner)"
                placeholder={
                  farmerQuery.isLoading ? "Loading farmers…" : "Select a farmer"
                }
                value={field.value || null}
                options={farmerOptions}
                onChange={field.onChange}
                disabled={editing !== null}
                error={form.formState.errors.farmerId?.message}
              />
            )}
          />
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
                error={form.formState.errors.speciesId?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="breedId"
            render={({ field }) => (
              <Select
                label="Breed (optional)"
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
                  placeholder="Type the breed as the farmer knows it"
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
          <Controller
            control={form.control}
            name="breedingStatus"
            render={({ field }) => (
              <Select
                label="Breeding status"
                value={field.value}
                options={statusOptions}
                onChange={field.onChange}
              />
            )}
          />
          {editing ? (
            <Select
              label="Active"
              value={activeFlag ? "yes" : "no"}
              options={[
                { label: "Active", value: "yes" },
                { label: "Inactive", value: "no" },
              ]}
              onChange={(v) => setActiveFlag(v === "yes")}
            />
        ) : null}
        </View>
      </Dialog>
    </View>
  );
}
