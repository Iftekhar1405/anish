import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { ApiError } from "@ai-platform/api-client";
import { loginFormSchema, type LoginFormValues } from "@ai-platform/types";
import { useAuth } from "../../src/auth/AuthProvider";

const ROLE = "ADMIN" as const;

export default function LoginScreen() {
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { phone: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await login({ ...values, role: ROLE });
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  });

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="grow justify-center gap-4 p-6"
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-1">
        <Text className="text-3xl font-bold text-neutral-900">Welcome back</Text>
        <Text className="text-sm text-neutral-500">Sign in to the Admin app</Text>
      </View>

      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange, onBlur } }) => (
          <Field label="Phone" error={errors.phone?.message}>
            <TextInput
              className="rounded-md border border-neutral-300 px-4 py-3 text-base text-neutral-900"
              placeholder="+919876543210"
              keyboardType="phone-pad"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <Field label="Password" error={errors.password?.message}>
            <TextInput
              className="rounded-md border border-neutral-300 px-4 py-3 text-base text-neutral-900"
              placeholder="Your password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          </Field>
        )}
      />

      {submitError ? (
        <Text className="text-sm text-error">{submitError}</Text>
      ) : null}

      <Pressable
        className={`mt-2 items-center rounded-md bg-primary-600 py-3 ${
          isSubmitting ? "opacity-50" : ""
        }`}
        disabled={isSubmitting}
        onPress={onSubmit}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-base font-semibold text-white">Sign in</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-neutral-700">{label}</Text>
      {children}
      {error ? <Text className="text-sm text-error">{error}</Text> : null}
    </View>
  );
}
