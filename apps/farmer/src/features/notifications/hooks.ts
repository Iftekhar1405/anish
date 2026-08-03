import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListNotificationsQuery } from "@ai-platform/types";
import { notificationsApi } from "./api";

const KEY = "my-notifications";

export function useMyNotifications(query: ListNotificationsQuery) {
  return useQuery({
    queryKey: [KEY, query],
    queryFn: () => notificationsApi.listMine(query),
    placeholderData: keepPreviousData,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
