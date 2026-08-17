import { useState } from "react";
import { View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { errorMessage } from "@ai-platform/api-client";
import {
  Button,
  Dialog,
  Input,
  Select,
  Table,
  useToast,
} from "@ai-platform/ui";
import {
  createTechnicianFormSchema,
  updateTechnicianFormSchema,
  type CreateTechnicianFormValues,
  type UpdateTechnicianFormInput,
  type UpdateTechnicianFormValues,
  type UserSummary,
} from "@ai-platform/types";
import {
  useCreateTechnician,
  useTechnicians,
  useUpdateTechnician,
} from "../../src/features/users/hooks";
import { serviceAreas } from "../../src/features/masters/hooks";

const PAGE_SIZE = 10;

export default function TechniciansScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<UserSummary | null>(null);
  const [active, setActive] = useState(true);
  const toast = useToast();

  const query = useTechnicians({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });
  const createTechnician = useCreateTechnician();
  const updateTechnician = useUpdateTechnician();

  const createForm = useForm<CreateTechnicianFormValues>({
    resolver: zodResolver(createTechnicianFormSchema),
    defaultValues: { name: "", phone: "", password: "" },
  });
  const editForm = useForm<UpdateTechnicianFormInput, unknown, UpdateTechnicianFormValues>({
    resolver: zodResolver(updateTechnicianFormSchema),
    defaultValues: { name: "", serviceAreaId: "" },
  });
  const serviceAreaQuery = serviceAreas.useList({ pageSize: 100 });
  const serviceAreaOptions = [
    { label: "None", value: "" },
    ...(serviceAreaQuery.data?.items ?? []).map((a) => ({ label: a.name, value: a.id })),
  ];

  function openCreate(): void {
    createForm.reset({ name: "", phone: "", password: "" });
    setCreating(true);
  }

  function openEdit(row: UserSummary): void {
    setEditing(row);
    setActive(row.isActive);
    editForm.reset({ name: row.name, serviceAreaId: row.serviceAreaId ?? "" });
  }

  const onCreate = createForm.handleSubmit(async (values) => {
    try {
      await createTechnician.mutateAsync(values);
      toast.show("Technician created", "success");
      setCreating(false);
    } catch (err) {
      toast.show(errorMessage(err, "Could not create technician"), "error");
    }
  });

  const onEdit = editForm.handleSubmit(async (values) => {
    if (!editing) return;
    try {
      await updateTechnician.mutateAsync({
        id: editing.id,
        input: { name: values.name, isActive: active, serviceAreaId: values.serviceAreaId },
      });
      toast.show("Technician updated", "success");
      setEditing(null);
    } catch {
      toast.show("Could not update technician", "error");
    }
  });

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            placeholder="Search by name or phone"
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              setPage(1);
            }}
          />
        </View>
        <Button size="sm" onPress={openCreate}>
          Add
        </Button>
      </View>

      <Table<UserSummary>
        columns={[
          { key: "name", header: "Name", accessor: (r) => r.name },
          { key: "phone", header: "Phone", accessor: (r) => r.phone },
          {
            key: "status",
            header: "Status",
            accessor: (r) => (r.isActive ? "Active" : "Inactive"),
          },
          {
            key: "createdAt",
            header: "Added",
            hideOnMobile: true,
            accessor: (r) => new Date(r.createdAt).toLocaleDateString(),
          },
        ]}
        data={query.data?.items ?? []}
        keyExtractor={(r) => r.id}
        loading={query.isLoading}
        error={query.isError ? "Couldn't load technicians." : undefined}
        onRetry={() => query.refetch()}
        emptyTitle="No technicians yet"
        emptyDescription="Add your first technician to start assigning bookings."
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
        visible={creating}
        title="Add technician"
        confirmLabel="Create"
        loading={createTechnician.isPending}
        onConfirm={onCreate}
        onCancel={() => setCreating(false)}
      >
        <View className="gap-3">
          <Controller
            control={createForm.control}
            name="name"
            render={({ field }) => (
              <Input
                label="Name"
                value={field.value}
                onChangeText={field.onChange}
                error={createForm.formState.errors.name?.message}
              />
            )}
          />
          <Controller
            control={createForm.control}
            name="phone"
            render={({ field }) => (
              <Input
                label="Phone"
                placeholder="+919876543210"
                keyboardType="phone-pad"
                autoCapitalize="none"
                value={field.value}
                onChangeText={field.onChange}
                error={createForm.formState.errors.phone?.message}
              />
            )}
          />
          <Controller
            control={createForm.control}
            name="password"
            render={({ field }) => (
              <Input
                label="Initial password"
                secureTextEntry
                value={field.value}
                onChangeText={field.onChange}
                error={createForm.formState.errors.password?.message}
              />
            )}
          />
        </View>
      </Dialog>

      <Dialog
        visible={editing !== null}
        title="Edit technician"
        confirmLabel="Save"
        loading={updateTechnician.isPending}
        onConfirm={onEdit}
        onCancel={() => setEditing(null)}
      >
        <View className="gap-3">
          <Controller
            control={editForm.control}
            name="name"
            render={({ field }) => (
              <Input
                label="Name"
                value={field.value}
                onChangeText={field.onChange}
                error={editForm.formState.errors.name?.message}
              />
            )}
          />
          <Controller
            control={editForm.control}
            name="serviceAreaId"
            render={({ field }) => (
              <Select
                label="Service area"
                placeholder={serviceAreaQuery.isLoading ? "Loading…" : "Select a service area"}
                value={field.value || ""}
                options={serviceAreaOptions}
                onChange={field.onChange}
              />
            )}
          />
          <Select
            label="Status"
            value={active ? "active" : "inactive"}
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            onChange={(v) => setActive(v === "active")}
          />
        </View>
      </Dialog>
    </View>
  );
}
