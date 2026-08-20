import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateProfileInput } from "@ai-platform/types";
import { profileApi } from "./api";

const KEY = "my-profile";

export function useMyProfile() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => profileApi.me(),
  });
}

export function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profileApi.update(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

/**
 * Account deletion. No cache invalidation on purpose: the caller logs the
 * user straight out, so every query is torn down with the session.
 */
export function useDeleteMyAccount() {
  return useMutation({
    mutationFn: () => profileApi.deleteAccount(),
  });
}
