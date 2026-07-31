import { useState } from "react";
import { Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dialog, Input, Table, useToast, type TableColumn } from "@ai-platform/ui";
import {
  createAdminUserFormSchema,
  updateAdminUserFormSchema,
  type AdminUserSummary,
  type CreateAdminUserFormValues,
  type UpdateAdminUserFormValues,
} from "@ai-platform/types";
import { ApiError } from "@ai-platform/api-client";
import { useCreateFarmerMutation, useFarmersQuery, useUpdateFarmerMutation } from "./hooks";

const PAGE_SIZE = 10;

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError || error instanceof Error ? error.message : fallback;
}

export function FarmersScreen() {
  const { show } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserSummary | null>(null);
  const [statusTarget, setStatusTarget] = useState<AdminUserSummary | null>(null);

  const query = useFarmersQuery({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    sortBy,
    sortDir,
  });
  const createMutation = useCreateFarmerMutation();
  const updateMutation = useUpdateFarmerMutation();

  const createForm = useForm<CreateAdminUserFormValues>({
    resolver: zodResolver(createAdminUserFormSchema),
    defaultValues: { phone: "", name: "" },
  });

  const editForm = useForm<UpdateAdminUserFormValues>({
    resolver: zodResolver(updateAdminUserFormSchema),
    defaultValues: { name: "" },
  });

  function openCreate(): void {
    createForm.reset({ phone: "", name: "" });
    setCreateOpen(true);
  }

  async function onCreateSubmit(values: CreateAdminUserFormValues): Promise<void> {
    try {
      await createMutation.mutateAsync(values);
      setCreateOpen(false);
      show("Farmer added.", "success");
    } catch (error) {
      show(errorMessage(error, "Could not add farmer."), "error");
    }
  }

  function openEdit(user: AdminUserSummary): void {
    editForm.reset({ name: user.name ?? "" });
    setEditingUser(user);
  }

  async function onEditSubmit(values: UpdateAdminUserFormValues): Promise<void> {
    if (!editingUser) return;
    try {
      await updateMutation.mutateAsync({ id: editingUser.id, input: values });
      setEditingUser(null);
      show("Farmer updated.", "success");
    } catch (error) {
      show(errorMessage(error, "Could not update farmer."), "error");
    }
  }

  async function confirmStatusChange(): Promise<void> {
    if (!statusTarget) return;
    try {
      await updateMutation.mutateAsync({
        id: statusTarget.id,
        input: { isActive: !statusTarget.isActive },
      });
      show(statusTarget.isActive ? "Farmer deactivated." : "Farmer reactivated.", "success");
    } catch (error) {
      show(errorMessage(error, "Could not update status."), "error");
    } finally {
      setStatusTarget(null);
    }
  }

  const columns: TableColumn<AdminUserSummary>[] = [
    { key: "name", header: "Name", accessor: (row) => row.name ?? "—", sortable: true },
    { key: "phone", header: "Phone", accessor: (row) => row.phone, sortable: true },
    {
      key: "isActive",
      header: "Status",
      render: (row) => (
        <Text
          className={
            row.isActive
              ? "text-sm font-medium text-success"
              : "text-sm font-medium text-neutral-500"
          }
        >
          {row.isActive ? "Active" : "Inactive"}
        </Text>
      ),
    },
  ];

  return (
    <View className="flex-1 bg-neutral-50 p-6">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xl font-semibold text-neutral-900">Farmers</Text>
        <Button size="sm" onPress={openCreate}>
          Add Farmer
        </Button>
      </View>

      <Input
        placeholder="Search by name or phone"
        value={search}
        onChangeText={(value) => {
          setSearch(value);
          setPage(1);
        }}
        containerClassName="mb-4 max-w-sm"
      />

      <Table
        columns={columns}
        data={query.data?.items ?? []}
        keyExtractor={(row) => row.id}
        loading={query.isLoading}
        error={query.isError ? "Could not load farmers." : undefined}
        onRetry={() => query.refetch()}
        emptyTitle="No farmers yet"
        emptyDescription="Farmers you add will appear here."
        sortKey={sortBy}
        sortDirection={sortDir}
        onSortChange={(key, direction) => {
          setSortBy(key);
          setSortDir(direction);
          setPage(1);
        }}
        page={query.data?.page ?? page}
        pageCount={query.data?.pageCount ?? 1}
        onPageChange={setPage}
        actionsColumnWidth={180}
        renderActions={(row) => (
          <>
            <Button variant="ghost" size="sm" onPress={() => openEdit(row)}>
              Edit
            </Button>
            <Button
              variant={row.isActive ? "destructive" : "outline"}
              size="sm"
              onPress={() => setStatusTarget(row)}
            >
              {row.isActive ? "Deactivate" : "Reactivate"}
            </Button>
          </>
        )}
      />

      <Dialog
        visible={createOpen}
        title="Add Farmer"
        confirmLabel="Add"
        loading={createMutation.isPending}
        onConfirm={createForm.handleSubmit(onCreateSubmit)}
        onCancel={() => setCreateOpen(false)}
      >
        <View className="gap-4">
          <Controller
            control={createForm.control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Full name"
                placeholder="Ramesh Kumar"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={createForm.formState.errors.name?.message}
              />
            )}
          />
          <Controller
            control={createForm.control}
            name="phone"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Phone number"
                placeholder="+919876543210"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={createForm.formState.errors.phone?.message}
              />
            )}
          />
        </View>
      </Dialog>

      <Dialog
        visible={editingUser !== null}
        title="Edit Farmer"
        confirmLabel="Save"
        loading={updateMutation.isPending}
        onConfirm={editForm.handleSubmit(onEditSubmit)}
        onCancel={() => setEditingUser(null)}
      >
        <Controller
          control={editForm.control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Full name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={editForm.formState.errors.name?.message}
            />
          )}
        />
      </Dialog>

      <Dialog
        visible={statusTarget !== null}
        title={statusTarget?.isActive ? "Deactivate farmer?" : "Reactivate farmer?"}
        description={
          statusTarget?.isActive
            ? `${statusTarget.name ?? "This farmer"} will no longer be able to log in.`
            : `${statusTarget?.name ?? "This farmer"} will be able to log in again.`
        }
        confirmLabel={statusTarget?.isActive ? "Deactivate" : "Reactivate"}
        destructive={statusTarget?.isActive ?? false}
        loading={updateMutation.isPending}
        onConfirm={confirmStatusChange}
        onCancel={() => setStatusTarget(null)}
      />
    </View>
  );
}
