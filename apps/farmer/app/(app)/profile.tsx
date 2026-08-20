import { useState } from "react";
import { Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { errorMessage } from "@ai-platform/api-client";
import {
  Button,
  Card,
  Dialog,
  Input,
  KeyboardScreen,
  Select,
  Spinner,
  useToast,
} from "@ai-platform/ui";
import {
  updateProfileFormSchema,
  type UpdateProfileFormInput,
  type UpdateProfileFormValues,
} from "@ai-platform/types";
import { useAuth } from "../../src/auth/AuthProvider";
import { useDistricts } from "../../src/features/districts/hooks";
import {
  useDeleteMyAccount,
  useMyProfile,
  useUpdateMyProfile,
} from "../../src/features/profile/hooks";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const profileQuery = useMyProfile();
  const districtsQuery = useDistricts();
  const update = useUpdateMyProfile();
  const toast = useToast();
  const removeAccount = useDeleteMyAccount();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
      toast.show(errorMessage(err, "Could not update profile"), "error");
    }
  });

  const onDelete = async () => {
    setDeleteError(null);
    try {
      await removeAccount.mutateAsync();
      setConfirmDelete(false);
      // The server has already revoked every refresh token, so this is just
      // the local teardown — it clears storage and routes back to login.
      await logout();
    } catch (err) {
      setDeleteError(errorMessage(err, "Could not delete your account"));
    }
  };

  return (
    <KeyboardScreen className="bg-neutral-50" contentContainerClassName="gap-4 p-4">
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

      <Card className="gap-3 border border-error/40">
        <Text className="text-base font-semibold text-neutral-900">
          Delete my account
        </Text>
        <Text className="text-sm text-neutral-500">
          Erases your name, phone number and address, cancels any visit that
          hasn’t happened yet, and signs you out everywhere. Completed
          insemination records stay with the service as breeding history, with
          your details removed from them.
        </Text>
        <Button
          variant="destructive"
          onPress={() => {
            setDeleteError(null);
            setConfirmDelete(true);
          }}
        >
          Delete my account
        </Button>
      </Card>

      <Dialog
        visible={confirmDelete}
        title="Delete your account?"
        description="This cannot be undone. You can register again later with the same phone number, but your animals and past bookings will not come back to the new account."
        confirmLabel="Delete account"
        cancelLabel="Keep my account"
        destructive
        loading={removeAccount.isPending}
        error={deleteError}
        onConfirm={() => {
          void onDelete();
        }}
        onCancel={() => {
          setConfirmDelete(false);
          setDeleteError(null);
        }}
      />
    </KeyboardScreen>
  );
}
