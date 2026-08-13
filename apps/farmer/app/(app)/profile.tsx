import { ScrollView, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ApiError } from "@ai-platform/api-client";
import { Button, Card, Input, Select, Spinner, useToast } from "@ai-platform/ui";
import {
  updateProfileFormSchema,
  type UpdateProfileFormInput,
  type UpdateProfileFormValues,
} from "@ai-platform/types";
import { useAuth } from "../../src/auth/AuthProvider";
import { useDistricts } from "../../src/features/districts/hooks";
import { useMyProfile, useUpdateMyProfile } from "../../src/features/profile/hooks";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const profileQuery = useMyProfile();
  const districtsQuery = useDistricts();
  const update = useUpdateMyProfile();
  const toast = useToast();

  const form = useForm<UpdateProfileFormInput, unknown, UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileFormSchema),
    values: profileQuery.data
      ? {
          address: profileQuery.data.address ?? "",
          districtId: profileQuery.data.districtId ?? "",
        }
      : undefined,
  });

  const districtOptions = [
    { label: "Select a district", value: "" },
    ...(districtsQuery.data?.items ?? []).map((d) => ({
      label: `${d.name}, ${d.state}`,
      value: d.id,
    })),
  ];

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync(values);
      toast.show("Profile updated", "success");
    } catch (err) {
      toast.show(
        err instanceof ApiError ? err.message : "Could not update profile",
        "error",
      );
    }
  });

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerClassName="gap-4 p-4"
      keyboardShouldPersistTaps="handled"
    >
      <Card className="gap-1">
        <Text className="text-lg font-semibold text-neutral-900">{user?.name}</Text>
        <Text className="text-sm text-neutral-500">{user?.phone}</Text>
        <Text className="text-sm text-neutral-500">Farmer account</Text>
      </Card>

      <Card className="gap-3">
        <Text className="text-base font-semibold text-neutral-900">
          Your location
        </Text>
        <Text className="text-sm text-neutral-500">
          So the technician assigned to your booking can find you.
        </Text>
        {profileQuery.isLoading ? (
          <Spinner label="Loading…" />
        ) : (
          <>
            <Controller
              control={form.control}
              name="address"
              render={({ field }) => (
                <Input
                  label="Address"
                  multiline
                  placeholder="House no., street, village"
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  error={form.formState.errors.address?.message}
                />
              )}
            />
            <Controller
              control={form.control}
              name="districtId"
              render={({ field }) => (
                <Select
                  label="District"
                  placeholder={
                    districtsQuery.isLoading ? "Loading districts…" : "Select a district"
                  }
                  value={field.value || ""}
                  options={districtOptions}
                  onChange={field.onChange}
                />
              )}
            />
            <Button onPress={onSubmit} loading={update.isPending}>
              Save
            </Button>
          </>
        )}
      </Card>

      <Button variant="outline" onPress={() => router.push("/notifications" as Href)}>
        Notifications
      </Button>

      <Button
        variant="outline"
        onPress={() => {
          void logout();
        }}
      >
        Log out
      </Button>
    </ScrollView>
  );
}
