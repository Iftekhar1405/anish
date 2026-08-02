import { useState } from "react";
import { View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ApiError } from "@ai-platform/api-client";
import { Button, Dialog, Input, Select, Table, useToast } from "@ai-platform/ui";
import {
  organizationFormSchema,
  type Organization,
  type OrganizationFormInput,
  type OrganizationFormValues,
} from "@ai-platform/types";
import { organizations } from "../../../src/features/masters/hooks";

const PAGE_SIZE = 10;

export default function OrganizationsScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [active, setActive] = useState(true);
  const toast = useToast();

  const query = organizations.useList({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });
  const create = organizations.useCreate();
  const update = organizations.useUpdate();

  const form = useForm<OrganizationFormInput, unknown, OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: { name: "", code: "", contact: "" },
  });

  function openCreate(): void {
    form.reset({ name: "", code: "", contact: "" });
    setCreating(true);
  }

  function openEdit(row: Organization): void {
    setEditing(row);
    setActive(row.isActive);
    form.reset({
      name: row.name,
      code: row.code ?? "",
      contact: row.contact ?? "",
    });
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          input: { ...values, isActive: active },
        });
        toast.show("Organization updated", "success");
        setEditing(null);
      } else {
        await create.mutateAsync(values);
        toast.show("Organization created", "success");
        setCreating(false);
      }
    } catch (err) {
      toast.show(
        err instanceof ApiError ? err.message : "Could not save organization",
        "error",
      );
    }
  });

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            placeholder="Search organizations"
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

      <Table<Organization>
        columns={[
          { key: "name", header: "Name", accessor: (r) => r.name },
          { key: "code", header: "Code", accessor: (r) => r.code },
          { key: "contact", header: "Contact", hideOnMobile: true, accessor: (r) => r.contact },
          {
            key: "status",
            header: "Status",
            accessor: (r) => (r.isActive ? "Active" : "Inactive"),
          },
        ]}
        data={query.data?.items ?? []}
        keyExtractor={(r) => r.id}
        loading={query.isLoading}
        error={query.isError ? "Couldn't load organizations." : undefined}
        onRetry={() => query.refetch()}
        emptyTitle="No organizations yet"
        emptyDescription="Add semen suppliers and partner organizations."
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
        title={editing ? "Edit organization" : "Add organization"}
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
            name="contact"
            render={({ field }) => (
              <Input
                label="Contact (optional)"
                value={field.value ?? ""}
                onChangeText={field.onChange}
                error={form.formState.errors.contact?.message}
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
