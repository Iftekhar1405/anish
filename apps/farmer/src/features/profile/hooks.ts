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
