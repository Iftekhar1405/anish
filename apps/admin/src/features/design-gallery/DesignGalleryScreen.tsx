import { useState, type ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  Button,
  Card,
  StatCard,
  EmptyState,
  Spinner,
  Skeleton,
  Input,
  Select,
  Dialog,
  Table,
  Sidebar,
  TopBar,
  BottomTabBar,
  useToast,
  type TableColumn,
} from "@ai-platform/ui";
import {
  Users,
  Milk,
  PackageCheck,
  Home,
  ClipboardList,
  User as UserIcon,
} from "lucide-react-native";

interface SampleRow {
  id: string;
  name: string;
  breed: string;
  status: "Available" | "Reserved";
}

const SAMPLE_ROWS: SampleRow[] = [
  { id: "1", name: "Batch A-104", breed: "Holstein Friesian", status: "Available" },
  { id: "2", name: "Batch A-108", breed: "Jersey", status: "Reserved" },
  { id: "3", name: "Batch B-002", breed: "Sahiwal", status: "Available" },
];

const TABLE_COLUMNS: TableColumn<SampleRow>[] = [
  { key: "name", header: "Batch", accessor: (row) => row.name, sortable: true },
  { key: "breed", header: "Breed", accessor: (row) => row.breed, hideOnMobile: true },
  { key: "status", header: "Status", accessor: (row) => row.status },
];

type TableDemoState = "data" | "loading" | "empty" | "error";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mb-10">
      <Text className="mb-4 text-lg font-semibold text-neutral-900">{title}</Text>
      {children}
    </View>
  );
}

export function DesignGalleryScreen() {
  const { show } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [selectValue, setSelectValue] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [destructiveDialogOpen, setDestructiveDialogOpen] = useState(false);
  const [tableDemo, setTableDemo] = useState<TableDemoState>("data");
  const [sidebarActive, setSidebarActive] = useState("dashboard");
  const [tabActive, setTabActive] = useState("home");

  return (
    <ScrollView className="flex-1 bg-neutral-50" contentContainerClassName="p-6">
      <Text className="mb-1 text-2xl font-bold text-primary-700">Design Gallery</Text>
      <Text className="mb-8 text-sm text-neutral-500">
        Dev-only reference for every packages/ui primitive and state. Not shown in production
        builds.
      </Text>

      <Section title="Buttons">
        <View className="flex-row flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
        </View>
        <View className="mt-3 flex-row flex-wrap gap-3">
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="primary" loading>
            Loading
          </Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
        </View>
      </Section>

      <Section title="Inputs">
        <View className="gap-4">
          <Input
            label="Farm name"
            placeholder="Green Valley Dairy"
            value={inputValue}
            onChangeText={setInputValue}
          />
          <Input
            label="Helper text"
            placeholder="e.g. +919876543210"
            helperText="Include the country code."
          />
          <Input label="With error" placeholder="you@example.com" error="Enter a valid email address." />
          <Input label="Disabled" value="Cannot edit" editable={false} />
          <Input label="Notes (textarea)" placeholder="Additional notes..." multiline numberOfLines={4} />
          <Select
            label="Preferred district"
            placeholder="Choose a district"
            value={selectValue}
            onChange={setSelectValue}
            options={[
              { label: "North District", value: "north" },
              { label: "South District", value: "south" },
              { label: "East District", value: "east" },
            ]}
          />
        </View>
      </Section>

      <Section title="Cards">
        <View className="flex-row flex-wrap gap-4">
          <StatCard
            label="Active Farmers"
            value={1284}
            icon={Users}
            trend={{ direction: "up", label: "4.2%" }}
          />
          <StatCard label="Straws in Stock" value={342} icon={PackageCheck} />
          <StatCard
            label="Conception Rate"
            value="68%"
            icon={Milk}
            trend={{ direction: "down", label: "1.1%" }}
          />
        </View>
        <Card className="mt-4">
          <Text className="text-base font-semibold text-neutral-900">Plain card</Text>
          <Text className="mt-1 text-sm text-neutral-500">
            Generic surface used as the base for domain-specific cards later on.
          </Text>
        </Card>
      </Section>

      <Section title="Empty state">
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="No bookings yet"
            description="Bookings will appear here once a farmer submits one."
            actionLabel="Refresh"
            onAction={() => show("Refreshed", "info")}
          />
        </Card>
      </Section>

      <Section title="Loading">
        <Card className="gap-3">
          <Spinner label="Fetching data..." />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
      </Section>

      <Section title="Toasts">
        <View className="flex-row flex-wrap gap-3">
          <Button variant="primary" size="sm" onPress={() => show("Booking saved.", "success")}>
            Success
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onPress={() => show("Could not save booking.", "error")}
          >
            Error
          </Button>
          <Button variant="secondary" size="sm" onPress={() => show("Straw stock is low.", "warning")}>
            Warning
          </Button>
          <Button variant="outline" size="sm" onPress={() => show("Sync complete.", "info")}>
            Info
          </Button>
        </View>
      </Section>

      <Section title="Dialogs">
        <View className="flex-row flex-wrap gap-3">
          <Button variant="primary" size="sm" onPress={() => setDialogOpen(true)}>
            Open confirm dialog
          </Button>
          <Button variant="destructive" size="sm" onPress={() => setDestructiveDialogOpen(true)}>
            Open destructive dialog
          </Button>
        </View>
        <Dialog
          visible={dialogOpen}
          title="Assign technician?"
          description="This booking will move to Assigned and the technician will be notified."
          confirmLabel="Assign"
          onConfirm={() => {
            setDialogOpen(false);
            show("Technician assigned.", "success");
          }}
          onCancel={() => setDialogOpen(false)}
        />
        <Dialog
          visible={destructiveDialogOpen}
          title="Cancel booking?"
          description="This cannot be undone."
          confirmLabel="Cancel booking"
          destructive
          onConfirm={() => {
            setDestructiveDialogOpen(false);
            show("Booking cancelled.", "success");
          }}
          onCancel={() => setDestructiveDialogOpen(false)}
        />
      </Section>

      <Section title="Table">
        <View className="mb-3 flex-row flex-wrap gap-2">
          {(["data", "loading", "empty", "error"] as TableDemoState[]).map((state) => (
            <Button
              key={state}
              variant={tableDemo === state ? "primary" : "outline"}
              size="sm"
              onPress={() => setTableDemo(state)}
            >
              {state[0].toUpperCase() + state.slice(1)}
            </Button>
          ))}
        </View>
        <Table
          columns={TABLE_COLUMNS}
          data={tableDemo === "data" ? SAMPLE_ROWS : []}
          keyExtractor={(row) => row.id}
          loading={tableDemo === "loading"}
          error={tableDemo === "error" ? "The server did not respond." : undefined}
          onRetry={() => setTableDemo("data")}
          emptyTitle="No batches found"
          page={1}
          pageCount={1}
        />
      </Section>

      <Section title="Navigation — Sidebar + TopBar (Admin)">
        <View className="h-72 flex-row overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-md">
          <Sidebar
            items={[
              { key: "dashboard", label: "Dashboard", icon: Home },
              { key: "farmers", label: "Farmers", icon: Users },
              { key: "bookings", label: "Bookings", icon: ClipboardList },
            ]}
            activeKey={sidebarActive}
            onSelect={setSidebarActive}
          />
          <View className="flex-1">
            <TopBar title="Dashboard" />
          </View>
        </View>
      </Section>

      <Section title="Navigation — Bottom Tabs (Farmer/Technician)">
        <View className="overflow-hidden rounded-lg border border-neutral-100 bg-white shadow-md">
          <BottomTabBar
            items={[
              { key: "home", label: "Home", icon: Home },
              { key: "profile", label: "Profile", icon: UserIcon },
            ]}
            activeKey={tabActive}
            onSelect={setTabActive}
          />
        </View>
      </Section>
    </ScrollView>
  );
}
