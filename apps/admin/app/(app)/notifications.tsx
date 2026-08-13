import { useState } from "react";
import { ScrollView } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ApiError } from "@ai-platform/api-client";
import { Button, Card, Input, Select, Table, useToast } from "@ai-platform/ui";
import {
  broadcastFormSchema,
  type AppNotification,
  type BroadcastFormInput,
  type BroadcastFormValues,
} from "@ai-platform/types";
import { useAllNotifications, useBroadcastNotification } from "../../src/features/notifications/hooks";

const PAGE_SIZE = 10;
const roleOptions = [
  { label: "Everyone", value: "" },
  { label: "Farmers", value: "FARMER" },
  { label: "Technicians", value: "TECHNICIAN" },
];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default function NotificationsScreen() {
  const [page, setPage] = useState(1);
  const toast = useToast();

  const query = useAllNotifications({ page, pageSize: PAGE_SIZE });
  const broadcast = useBroadcastNotification();

  const form = useForm<BroadcastFormInput, unknown, BroadcastFormValues>({
    resolver: zodResolver(broadcastFormSchema),
    defaultValues: { title: "", body: "", role: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await broadcast.mutateAsync({
        title: values.title,
        body: values.body,
        role: values.role,
      });
      toast.show(`Sent to ${result.recipients} recipient(s)`, "success");
      form.reset({ title: "", body: "", role: "" });
    } catch (err) {
      toast.show(
        err instanceof ApiError ? err.message : "Could not send notification",
        "error",
      );
    }
  });

  return (
    // Compose form + history are one continuous page; the Table opts out of its own
    // scrolling so the two don't fight over vertical gestures.
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerClassName="gap-3 p-4"
      keyboardShouldPersistTaps="handled"
    >
      <Card className="gap-3">
        <Controller
          control={form.control}
          name="title"
          render={({ field }) => (
            <Input
              label="Title"
              value={field.value}
              onChangeText={field.onChange}
              error={form.formState.errors.title?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="body"
          render={({ field }) => (
            <Input
              label="Message"
              multiline
              value={field.value}
              onChangeText={field.onChange}
              error={form.formState.errors.body?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="role"
          render={({ field }) => (
            <Select
              label="Audience"
              value={field.value ?? ""}
              options={roleOptions}
              onChange={field.onChange}
            />
          )}
        />
        <Button onPress={onSubmit} loading={broadcast.isPending}>
          Send
        </Button>
      </Card>

      <Table<AppNotification>
        columns={[
          { key: "title", header: "Title", accessor: (r) => r.title },
          { key: "recipient", header: "To", accessor: (r) => r.user?.name },
          { key: "event", header: "Event", hideOnMobile: true, accessor: (r) => r.event },
          {
            key: "status",
            header: "Read",
            accessor: (r) => (r.readAt ? "Yes" : "No"),
          },
          {
            key: "createdAt",
            header: "Sent",
            hideOnMobile: true,
            accessor: (r) => formatDateTime(r.createdAt),
          },
        ]}
        data={query.data?.items ?? []}
        keyExtractor={(r) => r.id}
        loading={query.isLoading}
        error={query.isError ? "Couldn't load notifications." : undefined}
        onRetry={() => query.refetch()}
        emptyTitle="No notifications sent yet"
        emptyDescription="Booking updates and broadcasts will appear here."
        page={page}
        pageCount={query.data?.pageCount ?? 1}
        onPageChange={setPage}
        scrollable={false}
      />
    </ScrollView>
  );
}
