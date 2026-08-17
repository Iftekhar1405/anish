import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ImagePlus, X } from "lucide-react-native";
import { errorMessage } from "@ai-platform/api-client";
import {
  Button,
  Dialog,
  Input,
  Select,
  Spinner,
  Table,
  useToast,
} from "@ai-platform/ui";
import {
  FERTILITY_RATINGS,
  sireFormSchema,
  type Sire,
  type SireFormInput,
  type SireFormValues,
} from "@ai-platform/types";
import {
  breeds,
  organizations,
  sires,
  species,
} from "../../../src/features/masters/hooks";
import { pickAndUploadImage } from "../../../src/features/masters/upload";

const PAGE_SIZE = 10;
const fertilityOptions = FERTILITY_RATINGS.map((f) => ({ label: f, value: f }));

function formatPrice(minor: number): string {
  return `₹${(minor / 100).toFixed(2)}`;
}

export default function CatalogueScreen() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Sire | null>(null);
  const [available, setAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const query = sires.useList({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
  });
  const breedQuery = breeds.useList({ pageSize: 100 });
  const speciesQuery = species.useList({ pageSize: 100, isActive: true });
  const orgQuery = organizations.useList({ pageSize: 100 });
  const create = sires.useCreate();
  const update = sires.useUpdate();

  const form = useForm<SireFormInput, unknown, SireFormValues>({
    resolver: zodResolver(sireFormSchema),
    defaultValues: {
      speciesId: "",
      name: "",
      breedId: "",
      organizationId: "",
      fertilityRating: "MEDIUM",
      strawPriceMinor: "",
      imageUrl: "",
      imagePublicId: "",
      geneticScore: "",
      milkYieldPotential: "",
      fatPct: "",
      growthIndex: "",
    },
  });

  const speciesId = form.watch("speciesId");
  const speciesOptions = (speciesQuery.data?.items ?? []).map((sp) => ({
    label: sp.name,
    value: sp.id,
  }));
  // A species list that failed to load leaves this form unfillable — say so,
  // rather than letting the user hit Save and get "Species is required".
  const speciesUnavailable = speciesQuery.isError
    ? "Couldn't load the species list — check your connection and try again."
    : speciesOptions.length === 0 && !speciesQuery.isLoading
      ? "No species yet. Add one under Masters → Species first."
      : null;

  // Which extra fields this species asks for — set by the admin on the species
  // itself, so a species added later still gets a sensible form.
  const metrics =
    (speciesQuery.data?.items ?? []).find((sp) => sp.id === speciesId)?.metrics ?? "DAIRY";

  const breedOptions = (breedQuery.data?.items ?? [])
    .filter((b) => b.speciesId === speciesId)
    .map((b) => ({ label: b.name, value: b.id }));
  const orgOptions = [
    { label: "None", value: "" },
    ...(orgQuery.data?.items ?? []).map((o) => ({ label: o.name, value: o.id })),
  ];

  function resetForm(): void {
    form.reset({
      speciesId: "",
      name: "",
      breedId: "",
      organizationId: "",
      fertilityRating: "MEDIUM",
      strawPriceMinor: "",
      imageUrl: "",
      imagePublicId: "",
      geneticScore: "",
      milkYieldPotential: "",
      fatPct: "",
      growthIndex: "",
    });
    setImageUrl(null);
  }

  function openCreate(): void {
    resetForm();
    setCreating(true);
  }

  function openEdit(row: Sire): void {
    setEditing(row);
    setAvailable(row.isAvailable);
    setImageUrl(row.imageUrl);
    form.reset({
      speciesId: row.speciesId,
      name: row.name,
      breedId: row.breedId,
      organizationId: row.organizationId ?? "",
      fertilityRating: row.fertilityRating,
      strawPriceMinor: String(row.strawPriceMinor),
      imageUrl: row.imageUrl ?? "",
      imagePublicId: row.imagePublicId ?? "",
      geneticScore: row.geneticScore != null ? String(row.geneticScore) : "",
      milkYieldPotential:
        row.milkYieldPotential != null ? String(row.milkYieldPotential) : "",
      fatPct: row.fatPct != null ? String(row.fatPct) : "",
      growthIndex: row.growthIndex != null ? String(row.growthIndex) : "",
    });
  }

  async function onPickImage(): Promise<void> {
    setUploading(true);
    try {
      const result = await pickAndUploadImage("sires");
      if (result) {
        form.setValue("imageUrl", result.imageUrl);
        form.setValue("imagePublicId", result.imagePublicId);
        setImageUrl(result.imageUrl);
        toast.show("Image uploaded", "success");
      }
    } catch (err) {
      toast.show(
        err instanceof Error ? err.message : "Image upload failed",
        "error",
      );
    } finally {
      setUploading(false);
    }
  }

  function clearImage(): void {
    form.setValue("imageUrl", "");
    form.setValue("imagePublicId", "");
    setImageUrl(null);
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          input: { ...values, isAvailable: available },
        });
        toast.show("Sire updated", "success");
        setEditing(null);
      } else {
        await create.mutateAsync(values);
        toast.show("Sire added", "success");
        setCreating(false);
      }
    } catch (err) {
      toast.show(errorMessage(err, "Could not save sire"), "error");
    }
  });

  return (
    <View className="flex-1 gap-3 bg-neutral-50 p-4">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            placeholder="Search bulls & bucks"
            value={search}
            onChangeText={(t) => {
              setSearch(t);
              setPage(1);
            }}
          />
        </View>
        <Button size="sm" onPress={openCreate}>
          Add
        </Button>
      </View>

      <Table<Sire>
        columns={[
          { key: "name", header: "Name", accessor: (r) => r.name },
          { key: "species", header: "Species", accessor: (r) => r.species?.name },
          { key: "breed", header: "Breed", hideOnMobile: true, accessor: (r) => r.breed?.name },
          {
            key: "price",
            header: "Straw price",
            accessor: (r) => formatPrice(r.strawPriceMinor),
          },
          {
            key: "available",
            header: "Available",
            hideOnMobile: true,
            accessor: (r) => (r.isAvailable ? "Yes" : "No"),
          },
        ]}
        data={query.data?.items ?? []}
        keyExtractor={(r) => r.id}
        loading={query.isLoading}
        error={query.isError ? "Couldn't load the catalogue." : undefined}
        onRetry={() => query.refetch()}
        emptyTitle="No sires yet"
        emptyDescription="Add bulls and bucks that farmers can book."
        page={page}
        pageCount={query.data?.pageCount ?? 1}
        onPageChange={setPage}
        renderActions={(r) => (
          <Button size="sm" variant="outline" onPress={() => openEdit(r)}>
            Edit
          </Button>
        )}
      />

      <Dialog
        visible={creating || editing !== null}
        title={editing ? "Edit sire" : "Add sire"}
        confirmLabel={editing ? "Save" : "Create"}
        loading={create.isPending || update.isPending}
        onConfirm={onSubmit}
        onCancel={() => {
          setCreating(false);
          setEditing(null);
        }}
      >
        <View className="gap-3">
          {/* Image uploader */}
          <View className="items-center gap-2">
            {imageUrl ? (
              // Padded so the absolutely-positioned remove button stays inside the
              // parent's bounds — Android does not deliver touches to children
              // rendered outside them.
              <View className="p-2">
                <Image
                  source={{ uri: imageUrl }}
                  className="h-28 w-28 rounded-lg bg-neutral-100"
                />
                <Pressable
                  onPress={clearImage}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                  className="absolute right-0 top-0 h-9 w-9 items-center justify-center rounded-full bg-neutral-900"
                >
                  <X size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={onPickImage}
                disabled={uploading}
                accessibilityRole="button"
                accessibilityLabel="Add photo"
                className="h-28 w-28 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50"
              >
                {uploading ? (
                  <Spinner />
                ) : (
                  <ImagePlus size={26} color="#9CA3AF" />
                )}
              </Pressable>
            )}
            <Text className="text-xs text-neutral-500">
              {imageUrl ? "Tap the ✕ to remove" : "Optional photo"}
            </Text>
          </View>

          <Controller
            control={form.control}
            name="speciesId"
            render={({ field }) => (
              <Select
                label="Species"
                placeholder={
                  speciesQuery.isLoading ? "Loading species…" : "Select a species"
                }
                value={field.value || null}
                options={speciesOptions}
                onChange={(v) => {
                  field.onChange(v);
                  // The breed list is species-scoped, so a stale pick has to go.
                  form.setValue("breedId", "");
                }}
                emptyMessage={speciesUnavailable ?? "No species available."}
                error={form.formState.errors.speciesId?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="name"
            render={({ field }) => (
              <Input
                label="Name"
                value={field.value}
                onChangeText={field.onChange}
                error={form.formState.errors.name?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="breedId"
            render={({ field }) => (
              <Select
                label="Breed"
                placeholder={
                  breedQuery.isLoading ? "Loading breeds…" : "Select a breed"
                }
                value={field.value || null}
                options={breedOptions}
                onChange={field.onChange}
                error={form.formState.errors.breedId?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="organizationId"
            render={({ field }) => (
              <Select
                label="Organization (optional)"
                value={field.value || ""}
                options={orgOptions}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={form.control}
            name="fertilityRating"
            render={({ field }) => (
              <Select
                label="Fertility rating"
                value={field.value}
                options={fertilityOptions}
                onChange={field.onChange}
                error={form.formState.errors.fertilityRating?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="strawPriceMinor"
            render={({ field }) => (
              <Input
                label="Straw price (in paise)"
                keyboardType="number-pad"
                value={field.value ?? ""}
                onChangeText={field.onChange}
                error={form.formState.errors.strawPriceMinor?.message}
              />
            )}
          />

          {metrics === "DAIRY" ? (
            <>
              <Controller
                control={form.control}
                name="geneticScore"
                render={({ field }) => (
                  <Input
                    label="Genetic score (optional)"
                    keyboardType="decimal-pad"
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    error={form.formState.errors.geneticScore?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="milkYieldPotential"
                render={({ field }) => (
                  <Input
                    label="Milk yield potential (optional)"
                    keyboardType="number-pad"
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    error={form.formState.errors.milkYieldPotential?.message}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="fatPct"
                render={({ field }) => (
                  <Input
                    label="Fat % (optional)"
                    keyboardType="decimal-pad"
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    error={form.formState.errors.fatPct?.message}
                  />
                )}
              />
            </>
          ) : (
            <Controller
              control={form.control}
              name="growthIndex"
              render={({ field }) => (
                <Input
                  label="Growth index (optional)"
                  keyboardType="decimal-pad"
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  error={form.formState.errors.growthIndex?.message}
                />
              )}
            />
          )}

          {editing ? (
            <Select
              label="Availability"
              value={available ? "yes" : "no"}
              options={[
                { label: "Available", value: "yes" },
                { label: "Unavailable", value: "no" },
              ]}
              onChange={(v) => setAvailable(v === "yes")}
            />
          ) : null}
        </View>
      </Dialog>
    </View>
  );
}
