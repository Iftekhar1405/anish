import { useState } from "react";
import { View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ApiError } from "@ai-platform/api-client";
import { Button, Dialog, Input, Table, useToast } from "@ai-platform/ui";
import {
  districtFormSchema,
  type District,
  type DistrictFormInput,
  type DistrictFormValues,
} from "@ai-platform/types";
import { districts } from "../../../src/features/masters/hooks";

const PAGE_SIZE = 10;

export default function DistrictsScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<District | null>(null);
  const toast = useToast();

  const query = districts.useList({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });
  const create = districts.useCreate();
  const update = districts.useUpdate();

  const form = useForm<DistrictFormInput, unknown, DistrictFormValues>({
    resolver: zodResolver(districtFormSchema),
    defaultValues: { name: "", state: "", code: "" },
  });

  function openCreate(): void {
    form.reset({ name: "", state: "", code: "" });
    setCreating(true);
  }

  function openEdit(row: District): void {
    setEditing(row);
    form.reset({ name: row.name, state: row.state, code: row.code ?? "" });
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, input: values });
        toast.show("District updated", "success");
        setEditing(null);
      } else {
        await create.mutateAsync(values);
        toast.show("District created", "success");
        setCreating(false);
      }
    } catch (err) {
      toast.show(
        err instanceof ApiError ? err.message : "Could not save district",
        "error",
      );
    }
  });

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            placeholder="Search districts"
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

      <Table<District>
        columns={[
          { key: "name", header: "Name", accessor: (r) => r.name },
          { key: "state", header: "State", accessor: (r) => r.state },
          { key: "code", header: "Code", hideOnMobile: true, accessor: (r) => r.code },
        ]}
        data={query.data?.items ?? []}
        keyExtractor={(r) => r.id}
        loading={query.isLoading}
        error={query.isError ? "Couldn't load districts." : undefined}
        onRetry={() => query.refetch()}
        emptyTitle="No districts yet"
        emptyDescription="Add districts to organize service areas."
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
        title={editing ? "Edit district" : "Add district"}
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
            name="state"
            render={({ field }) => (
              <Input
                label="State"
                value={field.value}
                onChangeText={field.onChange}
                error={form.formState.errors.state?.message}
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
        </View>
      </Dialog>
    </View>
  );
}
