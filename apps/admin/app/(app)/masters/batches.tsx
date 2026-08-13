import { useState } from "react";
import { View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ApiError } from "@ai-platform/api-client";
import { Button, Dialog, Input, Select, Table, useToast } from "@ai-platform/ui";
import {
  batchFormSchema,
  type Batch,
  type BatchFormInput,
  type BatchFormValues,
} from "@ai-platform/types";
import { batches, sires } from "../../../src/features/masters/hooks";

const PAGE_SIZE = 10;

export default function BatchesScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Batch | null>(null);
  const toast = useToast();

  const query = batches.useList({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });
  const sireQuery = sires.useList({ pageSize: 100 });
  const create = batches.useCreate();
  const update = batches.useUpdate();

  const sireOptions = (sireQuery.data?.items ?? []).map((s) => ({
    label: `${s.name} (${s.species})`,
    value: s.id,
  }));

  const form = useForm<BatchFormInput, unknown, BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      sireId: "",
      batchNumber: "",
      producedOn: "",
      notes: "",
      quantityTotal: "",
      quantityAvailable: "",
    },
  });

  function openCreate(): void {
    form.reset({
      sireId: "",
      batchNumber: "",
      producedOn: "",
      notes: "",
      quantityTotal: "",
      quantityAvailable: "",
    });
    setCreating(true);
  }

  function openEdit(row: Batch): void {
    setEditing(row);
    form.reset({
      sireId: row.sireId,
      batchNumber: row.batchNumber,
      producedOn: row.producedOn ? row.producedOn.slice(0, 10) : "",
      notes: row.notes ?? "",
      quantityTotal: String(row.quantityTotal),
      quantityAvailable: String(row.quantityAvailable),
    });
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          input: {
            batchNumber: values.batchNumber,
            producedOn: values.producedOn,
            notes: values.notes,
            quantityTotal: values.quantityTotal,
            quantityAvailable: values.quantityAvailable,
          },
        });
        toast.show("Batch updated", "success");
        setEditing(null);
      } else {
        await create.mutateAsync(values);
        toast.show("Batch created", "success");
        setCreating(false);
      }
    } catch (err) {
      toast.show(
        err instanceof ApiError ? err.message : "Could not save batch",
        "error",
      );
    }
  });

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            placeholder="Search batch numbers"
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

      <Table<Batch>
        columns={[
          { key: "batchNumber", header: "Batch #", accessor: (r) => r.batchNumber },
          { key: "sire", header: "Sire", accessor: (r) => r.sire?.name },
          {
            key: "available",
            header: "Available",
            align: "right",
            accessor: (r) => `${r.quantityAvailable}/${r.quantityTotal}`,
          },
        ]}
        data={query.data?.items ?? []}
        keyExtractor={(r) => r.id}
        loading={query.isLoading}
        error={query.isError ? "Couldn't load batches." : undefined}
        onRetry={() => query.refetch()}
        emptyTitle="No batches yet"
        emptyDescription="Add straw batches to track available inventory."
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
        title={editing ? "Edit batch" : "Add batch"}
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
            name="sireId"
            render={({ field }) => (
              <Select
                label="Sire"
                placeholder={
                  sireQuery.isLoading ? "Loading sires…" : "Select a sire"
                }
                value={field.value || null}
                options={sireOptions}
                onChange={field.onChange}
                disabled={editing !== null}
                error={form.formState.errors.sireId?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="batchNumber"
            render={({ field }) => (
              <Input
                label="Batch number"
                autoCapitalize="characters"
                value={field.value}
                onChangeText={field.onChange}
                error={form.formState.errors.batchNumber?.message}
              />
            )}
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller
                control={form.control}
                name="quantityTotal"
                render={({ field }) => (
                  <Input
                    label="Total qty"
                    keyboardType="number-pad"
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    error={form.formState.errors.quantityTotal?.message}
                  />
                )}
              />
            </View>
            <View className="flex-1">
              <Controller
                control={form.control}
                name="quantityAvailable"
                render={({ field }) => (
                  <Input
                    label="Available qty"
                    keyboardType="number-pad"
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    error={form.formState.errors.quantityAvailable?.message}
                  />
                )}
              />
            </View>
          </View>
          <Controller
            control={form.control}
            name="producedOn"
            render={({ field }) => (
              <Input
                label="Produced on (YYYY-MM-DD, optional)"
                placeholder="2026-01-15"
                autoCapitalize="none"
                value={field.value ?? ""}
                onChangeText={field.onChange}
                error={form.formState.errors.producedOn?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="notes"
            render={({ field }) => (
              <Input
                label="Notes (optional)"
                multiline
                value={field.value ?? ""}
                onChangeText={field.onChange}
                error={form.formState.errors.notes?.message}
              />
            )}
          />
        </View>
      </Dialog>
    </View>
  );
}
