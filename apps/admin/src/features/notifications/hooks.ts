import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListNotificationsQuery } from "@ai-platform/types";
import { notificationsApi, type BroadcastInput } from "./api";

const KEY = "admin-notifications";

export function useAllNotifications(query: ListNotificationsQuery) {
  return useQuery({
    queryKey: [KEY, query],
    queryFn: () => notificationsApi.listAll(query),
    placeholderData: keepPreviousData,
  });
}

export function useBroadcastNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BroadcastInput) => notificationsApi.broadcast(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
