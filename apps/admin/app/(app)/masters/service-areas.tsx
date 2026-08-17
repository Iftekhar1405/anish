import { useState } from "react";
import { View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { errorMessage } from "@ai-platform/api-client";
import { Button, Dialog, Input, Select, Table, useToast } from "@ai-platform/ui";
import {
  serviceAreaFormSchema,
  type ServiceArea,
  type ServiceAreaFormInput,
  type ServiceAreaFormValues,
} from "@ai-platform/types";
import { districts, serviceAreas } from "../../../src/features/masters/hooks";

const PAGE_SIZE = 10;

export default function ServiceAreasScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ServiceArea | null>(null);
  const [active, setActive] = useState(true);
  const toast = useToast();

  const query = serviceAreas.useList({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });
  const districtQuery = districts.useList({ pageSize: 100 });
  const create = serviceAreas.useCreate();
  const update = serviceAreas.useUpdate();

  const districtOptions = (districtQuery.data?.items ?? []).map((d) => ({
    label: `${d.name}, ${d.state}`,
    value: d.id,
  }));

  const form = useForm<ServiceAreaFormInput, unknown, ServiceAreaFormValues>({
    resolver: zodResolver(serviceAreaFormSchema),
    defaultValues: { name: "", districtId: "" },
  });

  function openCreate(): void {
    form.reset({ name: "", districtId: "" });
    setCreating(true);
  }

  function openEdit(row: ServiceArea): void {
    setEditing(row);
    setActive(row.isActive);
    form.reset({ name: row.name, districtId: row.districtId });
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          input: { name: values.name, isActive: active },
        });
        toast.show("Service area updated", "success");
        setEditing(null);
      } else {
        await create.mutateAsync(values);
        toast.show("Service area created", "success");
        setCreating(false);
      }
    } catch (err) {
      toast.show(errorMessage(err, "Could not save service area"), "error");
    }
  });

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            placeholder="Search service areas"
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

      <Table<ServiceArea>
        columns={[
          { key: "name", header: "Name", accessor: (r) => r.name },
          {
            key: "district",
            header: "District",
            accessor: (r) => (r.district ? `${r.district.name}, ${r.district.state}` : "—"),
          },
          {
            key: "status",
            header: "Status",
            hideOnMobile: true,
            accessor: (r) => (r.isActive ? "Active" : "Inactive"),
          },
        ]}
        data={query.data?.items ?? []}
        keyExtractor={(r) => r.id}
        loading={query.isLoading}
        error={query.isError ? "Couldn't load service areas." : undefined}
        onRetry={() => query.refetch()}
        emptyTitle="No service areas yet"
        emptyDescription="Add coverage areas within your districts."
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
        title={editing ? "Edit service area" : "Add service area"}
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
            name="districtId"
            render={({ field }) => (
              <Select
                label="District"
                placeholder={
                  districtQuery.isLoading ? "Loading districts…" : "Select a district"
                }
                value={field.value || null}
                options={districtOptions}
                onChange={field.onChange}
                disabled={editing !== null}
                error={form.formState.errors.districtId?.message}
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
