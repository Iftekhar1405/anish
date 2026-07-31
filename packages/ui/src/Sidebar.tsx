import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react-native";
import { cn } from "./utils/cn";

export interface NavItemConfig {
  key: string;
  label: string;
  icon?: LucideIcon;
}

export interface SidebarProps {
  items: NavItemConfig[];
  activeKey: string;
  onSelect: (key: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Sidebar({
  items,
  activeKey,
  onSelect,
  collapsed = false,
  onToggleCollapse,
  header,
  footer,
  className,
}: SidebarProps) {
  return (
    <View
      className={cn("h-full border-r border-neutral-100 bg-white", collapsed ? "w-16" : "w-64", className)}
    >
      {header ? <View className="border-b border-neutral-100 p-4">{header}</View> : null}

      <ScrollView className="flex-1 px-2 py-4" contentContainerClassName="gap-1">
        {items.map((item) => {
          const isActive = item.key === activeKey;
          const Icon = item.icon;
          return (
            <Pressable
              key={item.key}
              onPress={() => onSelect(item.key)}
              className={cn(
                "flex-row items-center gap-3 rounded-md px-3 py-2.5",
                isActive ? "bg-primary-50" : "active:bg-neutral-100",
              )}
            >
              {Icon ? <Icon size={20} color={isActive ? "#15803D" : "#6B7280"} /> : null}
              {!collapsed ? (
                <Text
                  className={cn(
                    "text-sm font-medium",
                    isActive ? "text-primary-700" : "text-neutral-700",
                  )}
                >
                  {item.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {onToggleCollapse ? (
        <Pressable
          onPress={onToggleCollapse}
          className="flex-row items-center justify-center border-t border-neutral-100 py-3"
        >
          {collapsed ? (
            <ChevronRight size={18} color="#6B7280" />
          ) : (
            <ChevronLeft size={18} color="#6B7280" />
          )}
        </Pressable>
      ) : null}

      {footer ? <View className="border-t border-neutral-100 p-4">{footer}</View> : null}
    </View>
  );
}
