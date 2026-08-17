import { useState, type ReactNode } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, ChevronDown } from "lucide-react-native";
import { Button } from "./Button";
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
  /** Shown in place of the list when there is nothing to choose from. */
  emptyMessage?: string;
}

export interface MultiSelectProps<T extends string = string> {
  label?: string;
  placeholder?: string;
  value: T[];
  options: SelectOption<T>[];
  onChange: (value: T[]) => void;
  error?: string;
  disabled?: boolean;
  /** Shown under the field, e.g. "3 selected". Defaults to the joined labels. */
  summary?: string;
  /** Shown in place of the list when there is nothing to choose from. */
  emptyMessage?: string;
}

/** The field itself — the tappable box that opens the sheet. */
function Trigger({
  label,
  text,
  isPlaceholder,
  error,
  disabled,
  onPress,
  hint,
}: {
  label?: string;
  text: string;
  isPlaceholder: boolean;
  error?: string;
  disabled: boolean;
  onPress: () => void;
  hint?: string;
}) {
  return (
    <>
      {label ? <Text className="mb-1 text-sm font-medium text-neutral-700">{label}</Text> : null}
      <Pressable
        disabled={disabled}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={hint}
        accessibilityState={{ disabled }}
        className={cn(
          "min-h-12 flex-row items-center justify-between rounded-md border px-4 py-3",
          error ? "border-error" : "border-neutral-300",
          disabled ? "bg-neutral-100" : "",
        )}
      >
        <Text
          className={cn("flex-1 text-base", isPlaceholder ? "text-neutral-500" : "text-neutral-900")}
          numberOfLines={1}
        >
          {text}
        </Text>
        <ChevronDown size={18} color="#6B7280" />
      </Pressable>
      {error ? <Text className="mt-1 text-sm text-error">{error}</Text> : null}
    </>
  );
}

/**
 * The bottom sheet the options live in.
 *
 * Android draws apps edge-to-edge, so without the bottom safe-area inset the
 * last option (and a multi-select's Done button) sit underneath the system
 * navigation buttons and can't be tapped. The sheet is also capped at 70% of
 * the window so a long list never pushes itself off the top.
 */
function OptionSheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: (maxHeight: number) => ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const listMaxHeight = Math.round(height * 0.7) - insets.bottom;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          onPress={(event) => event.stopPropagation()}
          className="rounded-t-xl bg-white p-2"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          {children(listMaxHeight)}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * An empty dropdown used to open as a blank sheet with nothing to tap and no
 * explanation — which reads as "the app is broken" when the real cause is that
 * the list behind it hasn't loaded.
 */
function EmptyOptions({ message }: { message: string }) {
  return (
    <View className="px-4 py-6">
      <Text className="text-center text-sm text-neutral-500">{message}</Text>
    </View>
  );
}

function OptionRow({
  label,
  selected,
  onPress,
  showCheck,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  showCheck: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(
        "min-h-12 flex-row items-center justify-between rounded-md px-4 py-3",
        selected ? "bg-primary-50" : "",
      )}
    >
      <Text
        className={cn(
          "flex-1 text-base",
          selected ? "font-semibold text-primary-700" : "text-neutral-900",
        )}
      >
        {label}
      </Text>
      {showCheck && selected ? <Check size={18} color="#15803D" /> : null}
    </Pressable>
  );
}

export function Select<T extends string = string>({
  label,
  placeholder = "Select an option",
  value,
  options,
  onChange,
  error,
  disabled = false,
  emptyMessage = "Nothing to choose from yet.",
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View className="w-full">
      <Trigger
        label={label}
        text={selected?.label ?? placeholder}
        isPlaceholder={!selected}
        error={error}
        disabled={disabled}
        hint={error ?? (selected ? undefined : placeholder)}
        onPress={() => setOpen(true)}
      />

      <OptionSheet visible={open} onClose={() => setOpen(false)}>
        {(maxHeight) =>
          options.length === 0 ? (
            <EmptyOptions message={emptyMessage} />
          ) : (
            <FlatList
              style={{ maxHeight }}
              data={options}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <OptionRow
                  label={item.label}
                  selected={item.value === value}
                  showCheck={false}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                />
              )}
            />
          )
        }
      </OptionSheet>
    </View>
  );
}

/** Same field, but the sheet stays open and toggles several values. */
export function MultiSelect<T extends string = string>({
  label,
  placeholder = "Select options",
  value,
  options,
  onChange,
  error,
  disabled = false,
  summary,
  emptyMessage = "Nothing to choose from yet.",
}: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);
  const text = selectedLabels.length
    ? (summary ?? selectedLabels.join(", "))
    : placeholder;

  function toggle(optionValue: T): void {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    );
  }

  return (
    <View className="w-full">
      <Trigger
        label={label}
        text={text}
        isPlaceholder={selectedLabels.length === 0}
        error={error}
        disabled={disabled}
        hint={error ?? placeholder}
        onPress={() => setOpen(true)}
      />

      <OptionSheet visible={open} onClose={() => setOpen(false)}>
        {(maxHeight) => (
          <>
            {options.length === 0 ? <EmptyOptions message={emptyMessage} /> : null}
            <FlatList
              style={{ maxHeight: maxHeight - 64 }}
              data={options}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <OptionRow
                  label={item.label}
                  selected={value.includes(item.value)}
                  showCheck
                  onPress={() => toggle(item.value)}
                />
              )}
            />
            <View className="px-2 pt-2">
              <Button onPress={() => setOpen(false)}>
                {selectedLabels.length ? `Done (${selectedLabels.length})` : "Done"}
              </Button>
            </View>
          </>
        )}
      </OptionSheet>
    </View>
  );
}
