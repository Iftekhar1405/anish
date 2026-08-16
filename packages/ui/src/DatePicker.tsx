import { useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react-native";
import { Button } from "./Button";
import { cn } from "./utils/cn";

export interface DatePickerProps {
  label?: string;
  /** ISO calendar date, `YYYY-MM-DD`. Empty string / null means "not set". */
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  /** Inclusive lower bound, `YYYY-MM-DD`. Earlier days are not selectable. */
  minDate?: string;
  /** Inclusive upper bound, `YYYY-MM-DD`. */
  maxDate?: string;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const pad = (n: number): string => String(n).padStart(2, "0");

/** `YYYY-MM-DD` for a local date — never `toISOString()`, which shifts by the UTC offset. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Parses a date for display, or null if malformed.
 *
 * A bare `YYYY-MM-DD`, or an instant pinned to UTC midnight (how calendar-day
 * fields like a booking's preferred date are stored), names a calendar day —
 * it's read as-is so the day shown is the day that was picked, in any
 * timezone. Anything else is a real moment (a completion timestamp, say) and
 * is read in the device's own timezone.
 */
export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(value);
  if (!match) return null;
  const [, year, month, day, hours, minutes] = match;
  const isCalendarDay = hours === undefined || (hours === "00" && minutes === "00");
  if (isCalendarDay) {
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const instant = new Date(value);
  return Number.isNaN(instant.getTime()) ? null : instant;
}

/** What farmers here read dates as: `DD-MM-YYYY`. */
export function formatDdMmYyyy(value: string | null | undefined): string {
  const date = parseIsoDate(value);
  if (!date) return "";
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

/** Monday-first index (0 = Monday) of a JS `getDay()` (0 = Sunday). */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = mondayIndex(first);
  const cells: (Date | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Select a date",
  error,
  helperText,
  disabled = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const selected = parseIsoDate(value);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const [cursor, setCursor] = useState(() => {
    const base = selected ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const cells = useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );

  function isSelectable(date: Date): boolean {
    const iso = toIsoDate(date);
    if (minDate && iso < minDate) return false;
    if (maxDate && iso > maxDate) return false;
    return true;
  }

  function openSheet(): void {
    const base = selected ?? today;
    setCursor(new Date(base.getFullYear(), base.getMonth(), 1));
    setOpen(true);
  }

  function shiftMonth(delta: number): void {
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  function pick(date: Date): void {
    onChange(toIsoDate(date));
    setOpen(false);
  }

  const displayText = formatDdMmYyyy(value) || placeholder;

  return (
    <View className="w-full">
      {label ? <Text className="mb-1 text-sm font-medium text-neutral-700">{label}</Text> : null}
      <Pressable
        disabled={disabled}
        onPress={openSheet}
        accessibilityRole="button"
        accessibilityLabel={label ?? "Date"}
        accessibilityHint={error ?? helperText ?? placeholder}
        accessibilityState={{ disabled }}
        className={cn(
          "min-h-12 flex-row items-center justify-between rounded-md border px-4 py-3",
          error ? "border-error" : "border-neutral-300",
          disabled ? "bg-neutral-100" : "",
        )}
      >
        <Text className={cn("text-base", selected ? "text-neutral-900" : "text-neutral-500")}>
          {displayText}
        </Text>
        <Calendar size={18} color="#6B7280" />
      </Pressable>
      {error ? (
        <Text className="mt-1 text-sm text-error">{error}</Text>
      ) : helperText ? (
        <Text className="mt-1 text-sm text-neutral-500">{helperText}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{ paddingBottom: insets.bottom + 16 }}
            className="rounded-t-xl bg-white px-4 pt-4"
          >
            <View className="mb-2 flex-row items-center justify-between">
              <Pressable
                onPress={() => shiftMonth(-1)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                className="h-11 w-11 items-center justify-center rounded-md"
              >
                <ChevronLeft size={22} color="#374151" />
              </Pressable>
              <Text className="text-base font-semibold text-neutral-900">
                {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
              </Text>
              <Pressable
                onPress={() => shiftMonth(1)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Next month"
                className="h-11 w-11 items-center justify-center rounded-md"
              >
                <ChevronRight size={22} color="#374151" />
              </Pressable>
            </View>

            <View className="flex-row">
              {WEEKDAYS.map((weekday) => (
                <View key={weekday} className="flex-1 items-center py-1">
                  <Text className="text-xs font-medium text-neutral-500">{weekday}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap">
              {cells.map((date, index) => {
                if (!date) {
                  // eslint-disable-next-line react/no-array-index-key -- blanks have no identity
                  return <View key={`blank-${index}`} className="h-12 w-[14.28%]" />;
                }
                const iso = toIsoDate(date);
                const isSelected = value === iso;
                const isToday = iso === toIsoDate(today);
                const selectable = isSelectable(date);
                return (
                  <Pressable
                    key={iso}
                    disabled={!selectable}
                    onPress={() => pick(date)}
                    accessibilityRole="button"
                    accessibilityLabel={formatDdMmYyyy(iso)}
                    accessibilityState={{ selected: isSelected, disabled: !selectable }}
                    className="h-12 w-[14.28%] items-center justify-center"
                  >
                    <View
                      className={cn(
                        "h-10 w-10 items-center justify-center rounded-full",
                        isSelected ? "bg-primary-600" : "",
                        !isSelected && isToday ? "border border-primary-600" : "",
                      )}
                    >
                      <Text
                        className={cn(
                          "text-base",
                          isSelected ? "font-semibold text-white" : "text-neutral-900",
                          !selectable ? "text-neutral-300" : "",
                        )}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-2 flex-row gap-3">
              <View className="flex-1">
                <Button variant="secondary" onPress={() => setOpen(false)}>
                  Cancel
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  variant="outline"
                  disabled={!isSelectable(today)}
                  onPress={() => pick(today)}
                >
                  Today
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
