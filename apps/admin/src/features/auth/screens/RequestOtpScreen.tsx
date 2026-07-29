import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { requestOtpFormSchema, type RequestOtpFormValues } from "../schema";
import { useAuth } from "../../../providers/AuthProvider";

export function RequestOtpScreen() {
  const router = useRouter();
  const { requestOtp } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestOtpFormValues>({
    resolver: zodResolver(requestOtpFormSchema),
    defaultValues: { phone: "" },
  });

  async function onSubmit(values: RequestOtpFormValues): Promise<void> {
    setServerError(null);
    try {
      await requestOtp(values.phone);
      router.push({ pathname: "/verify", params: { phone: values.phone } });
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Could not send the code. Try again.",
      );
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-neutral-50 px-6">
      <View className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md">
        <Text className="text-3xl font-bold text-primary-700">Admin Login</Text>
        <Text className="mt-2 text-base text-neutral-500">
          Enter your phone number to receive a one-time code.
        </Text>

        <View className="mt-8">
          <Text className="mb-1 text-sm font-medium text-neutral-700">Phone number</Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="+919876543210"
                keyboardType="phone-pad"
                autoComplete="tel"
                className={`rounded-md border px-4 py-3 text-base text-neutral-900 ${
                  errors.phone ? "border-error" : "border-neutral-300"
                }`}
              />
            )}
          />
          {errors.phone ? (
            <Text className="mt-1 text-sm text-error">{errors.phone.message}</Text>
          ) : null}
        </View>

        {serverError ? <Text className="mt-4 text-sm text-error">{serverError}</Text> : null}

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={`mt-6 items-center rounded-md bg-primary-600 py-3 ${isSubmitting ? "opacity-50" : ""}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-base font-semibold text-white">Send Code</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
