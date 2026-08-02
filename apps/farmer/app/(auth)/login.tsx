import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { ApiError } from "@ai-platform/api-client";
import { loginFormSchema, type LoginFormValues } from "@ai-platform/types";
import { useAuth } from "../../src/auth/AuthProvider";

const ROLE = "FARMER" as const;

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
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
    <View className="flex-1 justify-center gap-4 bg-white p-6">
      <View className="gap-1">
        <Text className="text-3xl font-bold text-neutral-900">Welcome back</Text>
        <Text className="text-sm text-neutral-500">Sign in to the Farmer app</Text>
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

      <Pressable onPress={() => router.push("/register" as string as Href)}>
        <Text className="text-center text-sm text-primary-700">
          New here? Create an account
        </Text>
      </Pressable>
    </View>
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
