import { useState } from "react";
import { View } from "react-native";
import { ApiError } from "@ai-platform/api-client";
import { Button, Dialog, Select, Table, useToast } from "@ai-platform/ui";
import { BOOKING_STATUSES, type Booking, type BookingStatus } from "@ai-platform/types";
import { useAssignBooking, useBookings } from "../../src/features/bookings/hooks";
import { useTechnicians } from "../../src/features/users/hooks";

const PAGE_SIZE = 10;
const statusOptions = [
  { label: "All statuses", value: "" },
  ...BOOKING_STATUSES.map((s) => ({ label: s, value: s })),
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

export default function BookingsScreen() {
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [assigning, setAssigning] = useState<Booking | null>(null);
  const [technicianId, setTechnicianId] = useState<string>("");
  const toast = useToast();

  const query = useBookings({
    page,
    pageSize: PAGE_SIZE,
    status: (status || undefined) as BookingStatus | undefined,
  });
  const assign = useAssignBooking();

  const technicianQuery = useTechnicians({
    pageSize: 100,
    districtId: assigning?.farmer?.district?.id,
  });
  const technicianOptions = (technicianQuery.data?.items ?? []).map((t) => ({
    label: `${t.name} (${t.phone})`,
    value: t.id,
  }));

  function openAssign(row: Booking): void {
    setAssigning(row);
    setTechnicianId("");
  }

  async function onAssign(): Promise<void> {
    if (!assigning || !technicianId) return;
    try {
      await assign.mutateAsync({ id: assigning.id, technicianId });
      toast.show("Booking assigned", "success");
      setAssigning(null);
    } catch (err) {
      toast.show(
        err instanceof ApiError ? err.message : "Could not assign booking",
        "error",
      );
    }
  }

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <Select
        label="Status"
        value={status}
        options={statusOptions}
        onChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
      />

      <Table<Booking>
        columns={[
          { key: "farmer", header: "Farmer", accessor: (r) => r.farmer?.name },
          { key: "animal", header: "Animal", accessor: (r) => r.animal?.tag },
          { key: "sire", header: "Bull/Buck", accessor: (r) => r.batch?.sire?.name },
          { key: "date", header: "Preferred date", accessor: (r) => formatDate(r.preferredDate) },
          { key: "status", header: "Status", accessor: (r) => r.status },
          {
            key: "technician",
            header: "Technician",
            hideOnMobile: true,
            accessor: (r) => r.technician?.name ?? "—",
          },
        ]}
        data={query.data?.items ?? []}
        keyExtractor={(r) => r.id}
        loading={query.isLoading}
        error={query.isError ? "Couldn't load bookings." : undefined}
        onRetry={() => query.refetch()}
        emptyTitle="No bookings yet"
        emptyDescription="Farmer bookings will show up here for review and assignment."
        page={page}
        pageCount={query.data?.pageCount ?? 1}
        onPageChange={setPage}
        renderActions={(r) =>
          r.status === "PENDING" ? (
            <Button size="sm" onPress={() => openAssign(r)}>
              Assign
            </Button>
          ) : null
        }
      />

      <Dialog
        visible={assigning !== null}
        title="Assign technician"
        description={
          assigning
            ? `${assigning.animal?.tag ?? "Animal"} · ${assigning.farmer?.name ?? ""}${
                assigning.farmer?.district ? ` (${assigning.farmer.district.name})` : ""
              }`
            : undefined
        }
        confirmLabel="Assign"
        loading={assign.isPending}
        onConfirm={onAssign}
        onCancel={() => setAssigning(null)}
      >
        <Select
          label="Technician"
          placeholder={technicianQuery.isLoading ? "Loading technicians…" : "Select a technician"}
          value={technicianId || null}
          options={technicianOptions}
          onChange={setTechnicianId}
        />
      </Dialog>
    </View>
  );
}
