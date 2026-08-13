import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import {
  Boxes,
  Building2,
  ChevronRight,
  Dna,
  Map,
  MapPin,
  Milk,
  PawPrint,
} from "lucide-react-native";
import { Card } from "@ai-platform/ui";

interface MasterLink {
  href: string;
  title: string;
  description: string;
  Icon: typeof Dna;
}

const MASTERS: MasterLink[] = [
  {
    href: "/masters/catalogue",
    title: "Semen Catalogue",
    description: "Bulls & bucks available for booking",
    Icon: Milk,
  },
  {
    href: "/masters/batches",
    title: "Inventory / Batches",
    description: "Straw batches & available stock",
    Icon: Boxes,
  },
  {
    href: "/masters/animals",
    title: "Animals",
    description: "Farmer-owned cattle & goats",
    Icon: PawPrint,
  },
  {
    href: "/masters/breeds",
    title: "Breeds",
    description: "Cattle & goat breeds",
    Icon: Dna,
  },
  {
    href: "/masters/organizations",
    title: "Organizations",
    description: "Semen suppliers & partners",
    Icon: Building2,
  },
  {
    href: "/masters/districts",
    title: "Districts",
    description: "States & districts served",
    Icon: MapPin,
  },
  {
    href: "/masters/service-areas",
    title: "Service Areas",
    description: "Coverage areas within districts",
    Icon: Map,
  },
];

export default function MastersHubScreen() {
  const router = useRouter();
  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerClassName="gap-3 p-4"
    >
      <Text className="text-sm text-neutral-500">
        Manage the reference data that powers bookings across all apps.
      </Text>
      {MASTERS.map(({ href, title, description, Icon }) => (
        <Pressable
          key={href}
          onPress={() => router.push(href as string as Href)}
        >
          <Card className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary-50">
              <Icon size={22} color="#15803D" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-neutral-900">
                {title}
              </Text>
              <Text className="text-sm text-neutral-500">{description}</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}
