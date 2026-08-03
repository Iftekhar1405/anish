import { FlatList, Pressable, Text, View } from "react-native";
import { Bell } from "lucide-react-native";
import { Card, EmptyState, Skeleton } from "@ai-platform/ui";
import type { AppNotification } from "@ai-platform/types";
import { useMarkNotificationRead, useMyNotifications } from "../../src/features/notifications/hooks";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationsScreen() {
  const query = useMyNotifications({ pageSize: 50 });
  const markRead = useMarkNotificationRead();
  const items = query.data?.items ?? [];

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      {query.isLoading ? (
        <View className="gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </View>
      ) : query.isError ? (
        <EmptyState
          title="Couldn't load notifications"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => query.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="Updates about your bookings will show up here."
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-2 pb-6"
          renderItem={({ item }) => <NotificationRow item={item} onMarkRead={() => markRead.mutate(item.id)} />}
        />
      )}
    </View>
  );
}

function NotificationRow({
  item,
  onMarkRead,
}: {
  item: AppNotification;
  onMarkRead: () => void;
}) {
  return (
    <Pressable onPress={() => !item.readAt && onMarkRead()}>
      <Card className={item.readAt ? "gap-1" : "gap-1 border-l-4 border-primary-600"}>
        <View className="flex-row items-center justify-between gap-2">
          <Text
            className={
              item.readAt
                ? "flex-1 text-sm font-medium text-neutral-700"
                : "flex-1 text-sm font-semibold text-neutral-900"
            }
          >
            {item.title}
          </Text>
          <Text className="text-xs text-neutral-400">{formatDateTime(item.createdAt)}</Text>
        </View>
        <Text className="text-sm text-neutral-500">{item.body}</Text>
      </Card>
    </Pressable>
  );
}
