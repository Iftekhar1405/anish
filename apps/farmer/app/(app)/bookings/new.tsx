import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { errorMessage } from "@ai-platform/api-client";
import {
  Button,
  DatePicker,
  Input,
  KeyboardScreen,
  MultiSelect,
  Select,
  Spinner,
  toIsoDate,
  useToast,
} from "@ai-platform/ui";
import {
  createBookingFormSchema,
  type CreateBookingFormInput,
  type CreateBookingFormValues,
} from "@ai-platform/types";
import { useMyAnimals } from "../../../src/features/animals/hooks";
import { useBatchesForSire, useSires } from "../../../src/features/catalogue/hooks";
import { useCreateBooking } from "../../../src/features/bookings/hooks";
import { useMyProfile } from "../../../src/features/profile/hooks";

export default function NewBookingScreen() {
  const router = useRouter();
  const toast = useToast();

  const animalsQuery = useMyAnimals({ pageSize: 100 });
  const profileQuery = useMyProfile();
  const create = useCreateBooking();
  const [sireId, setSireId] = useState("");

  const form = useForm<CreateBookingFormInput, unknown, CreateBookingFormValues>({
    resolver: zodResolver(createBookingFormSchema),
    defaultValues: {
      animalIds: [],
      batchId: "",
      preferredDate: "",
      location: "",
      notes: "",
    },
  });

  const animalIds = form.watch("animalIds");
  const animals = animalsQuery.data?.items ?? [];
  // Every animal in one booking run shares the same straw, so the species is
  // fixed by the first pick and the rest of the list is filtered to match.
  const selectedSpecies = animals.find((a) => a.id === animalIds[0])?.species;

  const siresQuery = useSires({ species: selectedSpecies, pageSize: 100 });
  const availableSires = (siresQuery.data?.items ?? []).filter((s) => s.isAvailable);

  const batchesQuery = useBatchesForSire({ sireId: sireId || undefined, pageSize: 20 });
  const availableBatch = (batchesQuery.data?.items ?? []).find((b) => b.quantityAvailable > 0);
  // One straw is consumed per animal, so a batch has to cover the whole group.
  const enoughStock = (availableBatch?.quantityAvailable ?? 0) >= animalIds.length;

  useEffect(() => {
    // Species changed (a different set of animals was picked) — the straw choice
    // no longer applies.
    setSireId("");
    form.setValue("batchId", "");
  }, [selectedSpecies, form]);

  useEffect(() => {
    form.setValue("batchId", availableBatch?.id ?? "");
  }, [availableBatch?.id, form]);

  useEffect(() => {
    // Pre-fill the visit location from the farmer's profile address; they can
    // still override it for this particular booking.
    const address = profileQuery.data?.address;
    if (address && !form.getValues("location")) form.setValue("location", address);
  }, [profileQuery.data?.address, form]);

  const animalOptions = animals
    .filter((a) => !selectedSpecies || a.species === selectedSpecies)
    .map((a) => ({ label: `${a.tag} (${a.species})`, value: a.id }));
  const sireOptions = availableSires.map((s) => ({
    label: `${s.name} — ₹${(s.strawPriceMinor / 100).toFixed(2)}`,
    value: s.id,
  }));

  const onSubmit = form.handleSubmit(async (values) => {
    const { animalIds: ids, ...shared } = values;
    // One booking per animal. A partial failure (e.g. the last straw goes to
    // someone else mid-submit) still keeps the bookings that did go through,
    // and says exactly which ones didn't.
    const failed: string[] = [];
    let firstId: string | null = null;
    for (const animalId of ids) {
      try {
        const booking = await create.mutateAsync({ ...shared, animalId });
        firstId ??= booking.id;
      } catch (err) {
        const tag = animals.find((a) => a.id === animalId)?.tag ?? "animal";
        failed.push(`${tag}: ${errorMessage(err, "could not be booked")}`);
      }
    }

    if (failed.length === ids.length) {
      toast.show(failed[0] ?? "Could not create booking", "error");
      return;
    }
    if (failed.length > 0) {
      toast.show(`Booked ${ids.length - failed.length} of ${ids.length}. ${failed[0]}`, "error");
    } else {
      toast.show(ids.length > 1 ? `${ids.length} bookings submitted` : "Booking submitted", "success");
    }
    router.replace(
      (firstId && ids.length === 1 ? `/bookings/${firstId}` : "/bookings") as Href,
    );
  });

  if (animalsQuery.isLoading) {
    return <Spinner label="Loading your animals…" className="flex-1" />;
  }

  if (animals.length === 0) {
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
    <KeyboardScreen className="bg-neutral-50" contentContainerClassName="gap-4 p-4">
      <Controller
        control={form.control}
        name="animalIds"
        render={({ field }) => (
          <MultiSelect
            label="1. Select animals"
            placeholder="Choose one or more animals"
            value={field.value}
            options={animalOptions}
            onChange={field.onChange}
            summary={field.value.length > 1 ? `${field.value.length} animals selected` : undefined}
            error={form.formState.errors.animalIds?.message}
          />
        )}
      />
      {selectedSpecies ? (
        <Text className="-mt-2 text-xs text-neutral-500">
          All animals in one booking must be {selectedSpecies.toLowerCase()} — they share the
          same straw.
        </Text>
      ) : null}

      {animalIds.length > 0 ? (
        <View className="gap-1">
          <Text className="text-sm font-medium text-neutral-700">
            2. Select bull / buck straw
          </Text>
          {siresQuery.isLoading ? (
            <Spinner label="Loading catalogue…" />
          ) : sireOptions.length === 0 ? (
            <Text className="text-sm text-neutral-500">
              No available {selectedSpecies?.toLowerCase()} straws right now.
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
          {availableBatch && !enoughStock ? (
            <Text className="text-sm text-error">
              Only {availableBatch.quantityAvailable} straw(s) left for this bull/buck — pick
              fewer animals or another one.
            </Text>
          ) : null}
        </View>
      ) : null}

      <Controller
        control={form.control}
        name="preferredDate"
        render={({ field }) => (
          <DatePicker
            label="3. Preferred date"
            placeholder="Tap to pick a date"
            helperText="Shown as DD-MM-YYYY"
            value={field.value || null}
            onChange={field.onChange}
            minDate={toIsoDate(new Date())}
            error={form.formState.errors.preferredDate?.message}
          />
        )}
      />

      <Controller
        control={form.control}
        name="location"
        render={({ field }) => (
          <Input
            label="4. Location for this visit"
            placeholder="Village / landmark / shed where the technician should come"
            multiline
            value={field.value ?? ""}
            onChangeText={field.onChange}
            helperText="Pre-filled from your profile address — change it if this visit is elsewhere."
            error={form.formState.errors.location?.message}
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

      <Button
        onPress={onSubmit}
        loading={create.isPending}
        disabled={!form.watch("batchId") || !enoughStock}
      >
        {animalIds.length > 1 ? `Submit ${animalIds.length} bookings` : "Submit booking"}
      </Button>
    </KeyboardScreen>
  );
}
