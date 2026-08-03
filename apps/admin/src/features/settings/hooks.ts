import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateSettingsInput } from "@ai-platform/types";
import { settingsApi } from "./api";

const KEY = "settings";

export function useSettings() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => settingsApi.get(),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => settingsApi.update(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
