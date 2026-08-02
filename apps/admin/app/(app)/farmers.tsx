import { useState } from "react";
import { View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Dialog,
  Input,
  Select,
  Table,
  useToast,
} from "@ai-platform/ui";
import {
  updateUserFormSchema,
  type UpdateUserFormValues,
  type UserSummary,
} from "@ai-platform/types";
import { useFarmers, useUpdateFarmer } from "../../src/features/users/hooks";

const PAGE_SIZE = 10;

export default function FarmersScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<UserSummary | null>(null);
  const [active, setActive] = useState(true);
  const toast = useToast();

  const query = useFarmers({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });
  const updateFarmer = useUpdateFarmer();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: { name: "" },
  });

  function openEdit(row: UserSummary): void {
    setEditing(row);
    setActive(row.isActive);
    reset({ name: row.name });
  }

  const onConfirm = handleSubmit(async (values) => {
    if (!editing) return;
    try {
      await updateFarmer.mutateAsync({
        id: editing.id,
        input: { name: values.name, isActive: active },
      });
      toast.show("Farmer updated", "success");
      setEditing(null);
    } catch {
      toast.show("Could not update farmer", "error");
    }
  });

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <Input
        placeholder="Search by name or phone"
        value={search}
        onChangeText={(text) => {
          setSearch(text);
          setPage(1);
        }}
      />

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
            header: "Joined",
            hideOnMobile: true,
            accessor: (r) => new Date(r.createdAt).toLocaleDateString(),
          },
        ]}
        data={query.data?.items ?? []}
        keyExtractor={(r) => r.id}
        loading={query.isLoading}
        error={query.isError ? "Couldn't load farmers." : undefined}
        onRetry={() => query.refetch()}
        emptyTitle="No farmers yet"
        emptyDescription="Farmers appear here after they register."
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
        visible={editing !== null}
        title="Edit farmer"
        confirmLabel="Save"
        loading={updateFarmer.isPending}
        onConfirm={onConfirm}
        onCancel={() => setEditing(null)}
      >
        <View className="gap-3">
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                label="Name"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.name?.message}
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
