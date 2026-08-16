import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { errorMessage } from "@ai-platform/api-client";
import { Button, Input, KeyboardScreen } from "@ai-platform/ui";
import { registerFormSchema, type RegisterFormValues } from "@ai-platform/types";
import { useAuth } from "../../src/auth/AuthProvider";

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: "", phone: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await register(values);
    } catch (err) {
      setSubmitError(errorMessage(err));
    }
  });

  return (
    <KeyboardScreen
      className="bg-white"
      contentContainerClassName="gap-4 p-6"
      center
      safeAreaBottom
    >
      <View className="gap-1">
        <Text className="text-3xl font-bold text-neutral-900">Create account</Text>
        <Text className="text-sm text-neutral-500">
          Register as a farmer to book AI services
        </Text>
      </View>

      <Controller
        control={control}
        name="name"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label="Full name"
            placeholder="Ramesh Kumar"
            autoCapitalize="words"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label="Phone"
            placeholder="+919876543210"
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoComplete="tel"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.phone?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label="Password"
            placeholder="At least 8 characters"
            secureTextEntry
            autoComplete="new-password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />

      {submitError ? <Text className="text-sm text-error">{submitError}</Text> : null}

      <Button className="mt-2" loading={isSubmitting} onPress={onSubmit}>
        Create account
      </Button>

      <Pressable
        className="min-h-11 justify-center"
        onPress={() => router.push("/login" as string as Href)}
      >
        <Text className="text-center text-sm text-primary-700">
          Already have an account? Sign in
        </Text>
      </Pressable>
    </KeyboardScreen>
  );
}
