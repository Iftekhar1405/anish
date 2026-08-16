import { useState } from "react";
import { View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { errorMessage } from "@ai-platform/api-client";
import { Button, Dialog, formatDdMmYyyy, Input, Select, Table, useToast } from "@ai-platform/ui";
import {
  updateFarmerFormSchema,
  type UpdateFarmerFormInput,
  type UpdateFarmerFormValues,
  type UserSummary,
} from "@ai-platform/types";
import { useFarmers, useUpdateFarmer } from "../../src/features/users/hooks";
import { districts } from "../../src/features/masters/hooks";

const PAGE_SIZE = 10;

/** The farmer's location as one line — what the technician actually travels to. */
function locationOf(farmer: UserSummary): string {
  return (
    [farmer.address, farmer.district?.name].filter(Boolean).join(", ") ||
    "Not on file"
  );
}

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
  const districtQuery = districts.useList({ pageSize: 100 });
  const updateFarmer = useUpdateFarmer();

  const districtOptions = [
    { label: "No district", value: "" },
    ...(districtQuery.data?.items ?? []).map((d) => ({
      label: `${d.name}, ${d.state}`,
      value: d.id,
    })),
  ];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateFarmerFormInput, unknown, UpdateFarmerFormValues>({
    resolver: zodResolver(updateFarmerFormSchema),
    defaultValues: { name: "", address: "", districtId: "" },
  });

  function openEdit(row: UserSummary): void {
    setEditing(row);
    setActive(row.isActive);
    reset({
      name: row.name,
      address: row.address ?? "",
      districtId: row.districtId ?? "",
    });
  }

  const onConfirm = handleSubmit(async (values) => {
    if (!editing) return;
    try {
      await updateFarmer.mutateAsync({
        id: editing.id,
        input: {
          name: values.name,
          address: values.address,
          districtId: values.districtId,
          isActive: active,
        },
      });
      toast.show("Farmer updated", "success");
      setEditing(null);
    } catch (err) {
      toast.show(errorMessage(err, "Could not update farmer"), "error");
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
          { key: "location", header: "Location", accessor: locationOf },
          {
            key: "status",
            header: "Status",
            accessor: (r) => (r.isActive ? "Active" : "Inactive"),
          },
          {
            key: "createdAt",
            header: "Joined",
            hideOnMobile: true,
            accessor: (r) => formatDdMmYyyy(r.createdAt),
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
          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <Input
                label="Address / location"
                placeholder="Village, landmark, shed"
                multiline
                value={field.value ?? ""}
                onChangeText={field.onChange}
                error={errors.address?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="districtId"
            render={({ field }) => (
              <Select
                label="District"
                placeholder={
                  districtQuery.isLoading ? "Loading districts…" : "Select a district"
                }
                value={field.value ?? ""}
                options={districtOptions}
                onChange={field.onChange}
                error={errors.districtId?.message}
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
