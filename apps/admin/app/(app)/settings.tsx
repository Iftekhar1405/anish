import { View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ApiError } from "@ai-platform/api-client";
import { Button, Card, Input, Spinner, useToast } from "@ai-platform/ui";
import {
  updateSettingsFormSchema,
  type UpdateSettingsFormInput,
  type UpdateSettingsFormValues,
} from "@ai-platform/types";
import { useSettings, useUpdateSettings } from "../../src/features/settings/hooks";

export default function SettingsScreen() {
  const query = useSettings();
  const update = useUpdateSettings();
  const toast = useToast();

  const form = useForm<UpdateSettingsFormInput, unknown, UpdateSettingsFormValues>({
    resolver: zodResolver(updateSettingsFormSchema),
    values: query.data
      ? {
          lowStockThreshold: String(query.data.lowStockThreshold),
          supportPhone: query.data.supportPhone ?? "",
        }
      : undefined,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync(values);
      toast.show("Settings saved", "success");
    } catch (err) {
      toast.show(
        err instanceof ApiError ? err.message : "Could not save settings",
        "error",
      );
    }
  });

  if (query.isLoading) return <Spinner label="Loading settings…" className="flex-1" />;

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <Card className="gap-3">
        <Controller
          control={form.control}
          name="lowStockThreshold"
          render={({ field }) => (
            <Input
              label="Low-stock threshold (straws)"
              helperText="Batches at or below this quantity show up under Low stock on the inventory report."
              keyboardType="number-pad"
              value={field.value}
              onChangeText={field.onChange}
              error={form.formState.errors.lowStockThreshold?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="supportPhone"
          render={({ field }) => (
            <Input
              label="Support phone (optional)"
              placeholder="+911234567890"
              keyboardType="phone-pad"
              value={field.value ?? ""}
              onChangeText={field.onChange}
              error={form.formState.errors.supportPhone?.message}
            />
          )}
        />
        <Button onPress={onSubmit} loading={update.isPending}>
          Save
        </Button>
      </Card>
    </View>
  );
}
