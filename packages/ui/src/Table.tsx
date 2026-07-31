import type { ReactNode } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react-native";
import { Button } from "./Button";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Loading";
import { cn } from "./utils/cn";

export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  render?: (row: T) => ReactNode;
  accessor?: (row: T) => string | number | null | undefined;
  /** Less important columns can be hidden in the mobile stacked-card view. */
  hideOnMobile?: boolean;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Sorting/pagination are controlled — the API sorts/paginates server-side. */
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (key: string, direction: "asc" | "desc") => void;
  renderActions?: (row: T) => ReactNode;
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  mobileBreakpoint?: number;
  /** Width (px) of the desktop actions column — widen if renderActions renders more than one button. */
  actionsColumnWidth?: number;
}

const DEFAULT_BREAKPOINT = 640;
const DEFAULT_ACTIONS_COLUMN_WIDTH = 160;

export function Table<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  error,
  onRetry,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  sortKey,
  sortDirection = "asc",
  onSortChange,
  renderActions,
  page,
  pageCount,
  onPageChange,
  mobileBreakpoint = DEFAULT_BREAKPOINT,
  actionsColumnWidth = DEFAULT_ACTIONS_COLUMN_WIDTH,
}: TableProps<T>) {
  const { width } = useWindowDimensions();
  const isMobile = width < mobileBreakpoint;

  function cellValue(column: TableColumn<T>, row: T): ReactNode {
    if (column.render) return column.render(row);
    const value = column.accessor?.(row);
    return value ?? "—";
  }

  function toggleSort(column: TableColumn<T>): void {
    if (!column.sortable || !onSortChange) return;
    const nextDirection: "asc" | "desc" =
      sortKey === column.key && sortDirection === "asc" ? "desc" : "asc";
    onSortChange(column.key, nextDirection);
  }

  const pagination =
    page !== undefined && pageCount !== undefined && onPageChange && pageCount > 1 ? (
      <View className="flex-row items-center justify-between border-t border-neutral-100 px-4 py-3">
        <Button variant="secondary" size="sm" disabled={page <= 1} onPress={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Text className="text-sm text-neutral-500">
          Page {page} of {pageCount}
        </Text>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= pageCount}
          onPress={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </View>
    ) : null;

  if (error) {
    return (
      <EmptyState
        title="Couldn't load this data"
        description={error}
        actionLabel={onRetry ? "Retry" : undefined}
        onAction={onRetry}
      />
    );
  }

  if (loading) {
    return (
      <View className="gap-2">
        {[0, 1, 2, 3].map((row) => (
          <Skeleton key={row} className="h-12 w-full" />
        ))}
      </View>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  if (isMobile) {
    return (
      <View className="gap-3">
        {data.map((row) => (
          <Card key={keyExtractor(row)} className="gap-2">
            {columns
              .filter((column) => !column.hideOnMobile)
              .map((column) => (
                <View key={column.key} className="flex-row justify-between">
                  <Text className="text-sm font-medium text-neutral-500">{column.header}</Text>
                  <Text className="text-sm text-neutral-900">{cellValue(column, row)}</Text>
                </View>
              ))}
            {renderActions ? (
              <View className="mt-2 flex-row justify-end gap-2">{renderActions(row)}</View>
            ) : null}
          </Card>
        ))}
        {pagination}
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-lg border border-neutral-100">
      <View className="flex-row bg-neutral-100 px-4 py-3">
        {columns.map((column) => (
          <Pressable
            key={column.key}
            disabled={!column.sortable}
            onPress={() => toggleSort(column)}
            className={cn(
              "flex-1 flex-row items-center gap-1",
              column.align === "right" ? "justify-end" : "",
              column.align === "center" ? "justify-center" : "",
            )}
          >
            <Text className="text-xs font-semibold uppercase text-neutral-500">
              {column.header}
            </Text>
            {column.sortable ? (
              <SortIcon active={sortKey === column.key} direction={sortDirection} />
            ) : null}
          </Pressable>
        ))}
        {renderActions ? <View style={{ width: actionsColumnWidth }} /> : null}
      </View>

      {data.map((row, index) => (
        <View
          key={keyExtractor(row)}
          className={cn(
            "flex-row items-center px-4 py-3",
            index % 2 === 1 ? "bg-neutral-50" : "bg-white",
          )}
        >
          {columns.map((column) => (
            <View
              key={column.key}
              className={cn(
                "flex-1",
                column.align === "right" ? "items-end" : "",
                column.align === "center" ? "items-center" : "",
              )}
            >
              <Text className="text-sm text-neutral-900">{cellValue(column, row)}</Text>
            </View>
          ))}
          {renderActions ? (
            <View
              className="flex-row items-center justify-end gap-2"
              style={{ width: actionsColumnWidth }}
            >
              {renderActions(row)}
            </View>
          ) : null}
        </View>
      ))}

      {pagination}
    </View>
  );
}

function SortIcon({ active, direction }: { active: boolean; direction: "asc" | "desc" }) {
  if (!active) return <ChevronsUpDown size={14} color="#9CA3AF" />;
  return direction === "asc" ? (
    <ChevronUp size={14} color="#374151" />
  ) : (
    <ChevronDown size={14} color="#374151" />
  );
}
