import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams } from "expo-router";
import { verifyOtpFormSchema, type VerifyOtpFormValues } from "../schema";
import { useAuth } from "../../../providers/AuthProvider";

export function VerifyOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp, requestOtp } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpFormSchema),
    defaultValues: { code: "" },
  });

  async function onSubmit(values: VerifyOtpFormValues): Promise<void> {
    setServerError(null);
    try {
      await verifyOtp(phone, values.code);
      // AuthProvider flips status to "authenticated"; the (app) layout redirects automatically.
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Invalid code. Try again.");
    }
  }

  async function onResend(): Promise<void> {
    setServerError(null);
    setResendMessage(null);
    try {
      await requestOtp(phone);
      setResendMessage("A new code has been sent.");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Could not resend the code.");
    }
  }

  return (
    <View className="flex-1 justify-center bg-neutral-50 px-6">
      <Text className="text-3xl font-bold text-primary-700">Enter Code</Text>
      <Text className="mt-2 text-base text-neutral-500">We sent a 6-digit code to {phone}.</Text>

      <View className="mt-8">
        <Text className="mb-1 text-sm font-medium text-neutral-700">Verification code</Text>
        <Controller
          control={control}
          name="code"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              className={`rounded-md border px-4 py-3 text-base text-neutral-900 ${
                errors.code ? "border-error" : "border-neutral-300"
              }`}
            />
          )}
        />
        {errors.code ? <Text className="mt-1 text-sm text-error">{errors.code.message}</Text> : null}
      </View>

      {serverError ? <Text className="mt-4 text-sm text-error">{serverError}</Text> : null}
      {resendMessage ? <Text className="mt-4 text-sm text-success">{resendMessage}</Text> : null}

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className={`mt-6 items-center rounded-md bg-primary-600 py-3 ${isSubmitting ? "opacity-50" : ""}`}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-base font-semibold text-white">Verify</Text>
        )}
      </Pressable>

      <Pressable onPress={onResend} className="mt-4 items-center py-2">
        <Text className="text-sm font-medium text-primary-600">Resend code</Text>
      </Pressable>
    </View>
  );
}
