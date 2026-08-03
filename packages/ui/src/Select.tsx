import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { cn } from "./utils/cn";

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

export interface SelectProps<T extends string = string> {
  label?: string;
  placeholder?: string;
  value: T | null;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
}

export function Select<T extends string = string>({
  label,
  placeholder = "Select an option",
  value,
  options,
  onChange,
  error,
  disabled = false,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View className="w-full">
      {label ? <Text className="mb-1 text-sm font-medium text-neutral-700">{label}</Text> : null}
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={error ?? (selected ? undefined : placeholder)}
        accessibilityState={{ disabled }}
        className={cn(
          "flex-row items-center justify-between rounded-md border px-4 py-3",
          error ? "border-error" : "border-neutral-300",
          disabled ? "bg-neutral-100" : "",
        )}
      >
        <Text className={cn("text-base", selected ? "text-neutral-900" : "text-neutral-500")}>
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={18} color="#6B7280" />
      </Pressable>
      {error ? <Text className="mt-1 text-sm text-error">{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <View className="max-h-96 rounded-t-xl bg-white p-2">
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: item.value === value }}
                  className={cn(
                    "rounded-md px-4 py-3",
                    item.value === value ? "bg-primary-50" : "",
                  )}
                >
                  <Text
                    className={cn(
                      "text-base",
                      item.value === value ? "font-semibold text-primary-700" : "text-neutral-900",
                    )}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
