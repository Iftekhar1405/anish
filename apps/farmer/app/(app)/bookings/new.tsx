import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ApiError } from "@ai-platform/api-client";
import { Button, Input, Select, Spinner, useToast } from "@ai-platform/ui";
import {
  createBookingFormSchema,
  type CreateBookingFormInput,
  type CreateBookingFormValues,
} from "@ai-platform/types";
import { useMyAnimals } from "../../../src/features/animals/hooks";
import { useBatchesForSire, useSires } from "../../../src/features/catalogue/hooks";
import { useCreateBooking } from "../../../src/features/bookings/hooks";

export default function NewBookingScreen() {
  const router = useRouter();
  const toast = useToast();

  const animalsQuery = useMyAnimals({ pageSize: 100 });
  const create = useCreateBooking();
  const [sireId, setSireId] = useState("");

  const form = useForm<CreateBookingFormInput, unknown, CreateBookingFormValues>({
    resolver: zodResolver(createBookingFormSchema),
    defaultValues: { animalId: "", batchId: "", preferredDate: "", notes: "" },
  });

  const animalId = form.watch("animalId");
  const selectedAnimal = animalsQuery.data?.items.find((a) => a.id === animalId);

  const siresQuery = useSires({
    species: selectedAnimal?.species,
    pageSize: 100,
  });
  const availableSires = (siresQuery.data?.items ?? []).filter((s) => s.isAvailable);

  const batchesQuery = useBatchesForSire({ sireId: sireId || undefined, pageSize: 20 });
  const availableBatch = (batchesQuery.data?.items ?? []).find((b) => b.quantityAvailable > 0);

  useEffect(() => {
    // Species changed (a different animal was picked) — the straw choice no longer applies.
    setSireId("");
    form.setValue("batchId", "");
  }, [animalId, form]);

  useEffect(() => {
    form.setValue("batchId", availableBatch?.id ?? "");
  }, [availableBatch?.id, form]);

  const animalOptions = (animalsQuery.data?.items ?? []).map((a) => ({
    label: `${a.tag} (${a.species})`,
    value: a.id,
  }));
  const sireOptions = availableSires.map((s) => ({
    label: `${s.name} — ₹${(s.strawPriceMinor / 100).toFixed(2)}`,
    value: s.id,
  }));

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const booking = await create.mutateAsync(values);
      toast.show("Booking submitted", "success");
      router.replace(`/bookings/${booking.id}` as Href);
    } catch (err) {
      toast.show(
        err instanceof ApiError ? err.message : "Could not create booking",
        "error",
      );
    }
  });

  if (animalsQuery.isLoading) {
    return <Spinner label="Loading your animals…" className="flex-1" />;
  }

  if ((animalsQuery.data?.items.length ?? 0) === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-neutral-50 p-6">
        <Text className="text-center text-base font-medium text-neutral-900">
          Add an animal first
        </Text>
        <Text className="text-center text-sm text-neutral-500">
          You need at least one animal on file before you can book an AI service.
        </Text>
        <Button className="mt-2" onPress={() => router.push("/animals" as Href)}>
          Go to My Animals
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerClassName="gap-4 p-4"
      keyboardShouldPersistTaps="handled"
    >
      <Controller
        control={form.control}
        name="animalId"
        render={({ field }) => (
          <Select
            label="1. Select animal"
            placeholder="Choose an animal"
            value={field.value || null}
            options={animalOptions}
            onChange={field.onChange}
            error={form.formState.errors.animalId?.message}
          />
        )}
      />

      {animalId ? (
        <View className="gap-1">
          <Text className="text-sm font-medium text-neutral-700">
            2. Select bull / buck straw
          </Text>
          {siresQuery.isLoading ? (
            <Spinner label="Loading catalogue…" />
          ) : sireOptions.length === 0 ? (
            <Text className="text-sm text-neutral-500">
              No available {selectedAnimal?.species.toLowerCase()} straws right now.
            </Text>
          ) : (
            <Select
              value={sireId || null}
              options={sireOptions}
              onChange={setSireId}
              placeholder="Choose a bull or buck"
            />
          )}
          {sireId && !batchesQuery.isLoading && !availableBatch ? (
            <Text className="text-sm text-error">This straw is currently out of stock.</Text>
          ) : null}
        </View>
      ) : null}

      <Controller
        control={form.control}
        name="preferredDate"
        render={({ field }) => (
          <Input
            label="3. Preferred date (YYYY-MM-DD)"
            placeholder="2026-09-01"
            autoCapitalize="none"
            value={field.value}
            onChangeText={field.onChange}
            error={form.formState.errors.preferredDate?.message}
          />
        )}
      />

      <Controller
        control={form.control}
        name="notes"
        render={({ field }) => (
          <Input
            label="Notes for the technician (optional)"
            multiline
            value={field.value ?? ""}
            onChangeText={field.onChange}
            error={form.formState.errors.notes?.message}
          />
        )}
      />

      <Button onPress={onSubmit} loading={create.isPending} disabled={!form.watch("batchId")}>
        Submit booking
      </Button>
    </ScrollView>
  );
}
