import { useState } from "react";
import { View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ApiError } from "@ai-platform/api-client";
import { Button, Dialog, Input, Select, Table, useToast } from "@ai-platform/ui";
import {
  breedFormSchema,
  SPECIES,
  type Breed,
  type BreedFormInput,
  type BreedFormValues,
} from "@ai-platform/types";
import { breeds } from "../../../src/features/masters/hooks";

const PAGE_SIZE = 10;
const speciesOptions = SPECIES.map((s) => ({ label: s, value: s }));

export default function BreedsScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Breed | null>(null);
  const [active, setActive] = useState(true);
  const toast = useToast();

  const query = breeds.useList({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });
  const create = breeds.useCreate();
  const update = breeds.useUpdate();

  const form = useForm<BreedFormInput, unknown, BreedFormValues>({
    resolver: zodResolver(breedFormSchema),
    defaultValues: { species: "CATTLE", name: "", code: "" },
  });

  function openCreate(): void {
    form.reset({ species: "CATTLE", name: "", code: "" });
    setCreating(true);
  }

  function openEdit(row: Breed): void {
    setEditing(row);
    setActive(row.isActive);
    form.reset({ species: row.species, name: row.name, code: row.code ?? "" });
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          input: { name: values.name, code: values.code, isActive: active },
        });
        toast.show("Breed updated", "success");
        setEditing(null);
      } else {
        await create.mutateAsync({
          species: values.species,
          name: values.name,
          code: values.code,
        });
        toast.show("Breed created", "success");
        setCreating(false);
      }
    } catch (err) {
      toast.show(
        err instanceof ApiError ? err.message : "Could not save breed",
        "error",
      );
    }
  });

  const dialogOpen = creating || editing !== null;

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            placeholder="Search breeds"
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

      <Table<Breed>
        columns={[
          { key: "name", header: "Name", accessor: (r) => r.name },
          { key: "species", header: "Species", accessor: (r) => r.species },
          { key: "code", header: "Code", hideOnMobile: true, accessor: (r) => r.code },
          {
            key: "status",
            header: "Status",
            accessor: (r) => (r.isActive ? "Active" : "Inactive"),
          },
        ]}
        data={query.data?.items ?? []}
        keyExtractor={(r) => r.id}
        loading={query.isLoading}
        error={query.isError ? "Couldn't load breeds." : undefined}
        onRetry={() => query.refetch()}
        emptyTitle="No breeds yet"
        emptyDescription="Add cattle and goat breeds to use across the catalogue."
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
        visible={dialogOpen}
        title={editing ? "Edit breed" : "Add breed"}
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
            name="species"
            render={({ field }) => (
              <Select
                label="Species"
                value={field.value}
                options={speciesOptions}
                onChange={field.onChange}
                disabled={editing !== null}
                error={form.formState.errors.species?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="name"
            render={({ field }) => (
              <Input
                label="Name"
                value={field.value}
                onChangeText={field.onChange}
                error={form.formState.errors.name?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="code"
            render={({ field }) => (
              <Input
                label="Code (optional)"
                autoCapitalize="characters"
                value={field.value ?? ""}
                onChangeText={field.onChange}
                error={form.formState.errors.code?.message}
              />
            )}
          />
          {editing ? (
            <Select
              label="Status"
              value={active ? "active" : "inactive"}
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
              onChange={(v) => setActive(v === "active")}
            />
          ) : null}
        </View>
      </Dialog>
    </View>
  );
}
