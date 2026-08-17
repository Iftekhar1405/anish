import { useState } from "react";
import { View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { errorMessage } from "@ai-platform/api-client";
import { Button, Dialog, Input, Select, Table, useToast } from "@ai-platform/ui";
import {
  speciesFormSchema,
  SPECIES_METRICS,
  SPECIES_METRICS_LABELS,
  type Species,
  type SpeciesFormInput,
  type SpeciesFormValues,
} from "@ai-platform/types";
import { species } from "../../../src/features/masters/hooks";

const PAGE_SIZE = 10;
const metricsOptions = SPECIES_METRICS.map((m) => ({
  label: SPECIES_METRICS_LABELS[m],
  value: m,
}));

const EMPTY_FORM: SpeciesFormInput = { name: "", code: "", metrics: "DAIRY" };

export default function SpeciesScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Species | null>(null);
  const [active, setActive] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const toast = useToast();

  const query = species.useList({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });
  const create = species.useCreate();
  const update = species.useUpdate();

  const form = useForm<SpeciesFormInput, unknown, SpeciesFormValues>({
    resolver: zodResolver(speciesFormSchema),
    defaultValues: EMPTY_FORM,
  });

  function openCreate(): void {
    form.reset(EMPTY_FORM);
    setSubmitError(null);
    setCreating(true);
  }

  function openEdit(row: Species): void {
    setEditing(row);
    setActive(row.isActive);
    setSubmitError(null);
    form.reset({ name: row.name, code: row.code ?? "", metrics: row.metrics });
  }

  function closeDialog(): void {
    setCreating(false);
    setEditing(null);
    setSubmitError(null);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, input: { ...values, isActive: active } });
        toast.show("Species updated", "success");
        setEditing(null);
      } else {
        await create.mutateAsync(values);
        toast.show("Species created", "success");
        setCreating(false);
      }
    } catch (err) {
      // Shown in the dialog *and* as a toast: the dialog stays open on failure,
      // so the reason has to be readable without hunting for a toast.
      const message = errorMessage(err, "Could not save species");
      setSubmitError(message);
      toast.show(message, "error");
    }
  });

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            placeholder="Search species"
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

      <Table<Species>
        columns={[
          { key: "name", header: "Name", accessor: (r) => r.name },
          { key: "code", header: "Code", hideOnMobile: true, accessor: (r) => r.code },
          {
            key: "metrics",
            header: "Sire details",
            accessor: (r) => (r.metrics === "DAIRY" ? "Dairy" : "Meat"),
          },
          {
            key: "status",
            header: "Status",
            accessor: (r) => (r.isActive ? "Active" : "Inactive"),
          },
        ]}
        data={query.data?.items ?? []}
        keyExtractor={(r) => r.id}
        loading={query.isLoading}
        error={query.isError ? "Couldn't load species." : undefined}
        onRetry={() => query.refetch()}
        emptyTitle="No species yet"
        emptyDescription="Add the animals you serve — cattle, goats, and anything else."
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
        title={editing ? "Edit species" : "Add species"}
        description="Species drive the breed list, the catalogue and every animal record."
        confirmLabel={editing ? "Save" : "Create"}
        loading={create.isPending || update.isPending}
        error={submitError}
        onConfirm={onSubmit}
        onCancel={closeDialog}
      >
        <View className="gap-3">
          <Controller
            control={form.control}
            name="name"
            render={({ field }) => (
              <Input
                label="Name"
                placeholder="Buffalo"
                autoCapitalize="words"
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
          <Controller
            control={form.control}
            name="metrics"
            render={({ field }) => (
              <Select
                label="Extra sire details"
                value={field.value}
                options={metricsOptions}
                onChange={field.onChange}
                error={form.formState.errors.metrics?.message}
              />
            )}
          />
          {editing ? (
            <Select
              label="Status"
              // Deactivating hides a species from the pickers; the animals,
              // breeds and sires already recorded against it are untouched,
              // which is why there's no delete.
              value={active ? "active" : "inactive"}
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive — hidden from new records", value: "inactive" },
              ]}
              onChange={(v) => setActive(v === "active")}
            />
          ) : null}
        </View>
      </Dialog>
    </View>
  );
}
