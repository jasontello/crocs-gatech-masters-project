import type {
  IdentificationStatus,
  InventoryItem,
} from "../types/inventory";

export const toDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInput(date);
};

export const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;

interface BarcodeFixture {
  name: string;
  brand?: string;
  packageSize: string;
  quantity: string;
  daysUntilUse: number;
  barcode: string;
  estimateBasis: string;
  status: IdentificationStatus;
}

const barcodeFixtures: BarcodeFixture[] = [
  {
    name: "Whole Milk",
    brand: "Horizon Organic",
    packageSize: "1 gallon",
    quantity: "1 carton",
    daysUntilUse: 7,
    barcode: "036632032156",
    estimateBasis: "Refrigerated milk storage guidance",
    status: "identified",
  },
  {
    name: "Large Brown Eggs",
    brand: "Eggland's Best",
    packageSize: "12 count",
    quantity: "1 carton",
    daysUntilUse: 21,
    barcode: "715141501123",
    estimateBasis: "Refrigerated shell egg guidance",
    status: "identified",
  },
  {
    name: "Chicken Thighs",
    brand: "Tyson",
    packageSize: "1.5 lb package",
    quantity: "1 package",
    daysUntilUse: 3,
    barcode: "023700014652",
    estimateBasis: "Fresh poultry storage guidance",
    status: "likely-match",
  },
  {
    name: "Greek Yogurt",
    brand: "Chobani",
    packageSize: "4 pack",
    quantity: "1 package",
    daysUntilUse: 12,
    barcode: "089104701250",
    estimateBasis: "Refrigerated yogurt storage guidance",
    status: "identified",
  },
  {
    name: "Prepared Pasta Salad",
    packageSize: "Deli container",
    quantity: "1 container",
    daysUntilUse: 2,
    barcode: "000000000005",
    estimateBasis: "Prepared refrigerated meal guidance",
    status: "needs-review",
  },
];

const makeInventoryItem = (
  input: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
): InventoryItem => {
  const now = new Date().toISOString();
  return { id: createId(), ...input, createdAt: now, updatedAt: now };
};

export function createBarcodeItem(scanIndex: number): InventoryItem {
  const fixture = barcodeFixtures[scanIndex % barcodeFixtures.length];
  return makeInventoryItem({
    name: fixture.name,
    brand: fixture.brand,
    packageSize: fixture.packageSize,
    quantity: fixture.quantity,
    addedAt: toDateInput(new Date()),
    expiresAt: addDays(fixture.daysUntilUse),
    entryMethod: "barcode",
    recognitionOutcome:
      fixture.status === "identified" ? "confirmed" : "corrected",
    originalSuggestion: fixture.name,
    identificationStatus: fixture.status,
    dateType:
      fixture.status === "needs-review" ? "needs-confirmation" : "estimated",
    estimateBasis: fixture.estimateBasis,
    barcode: fixture.barcode,
  });
}

export function createDemoItems(): InventoryItem[] {
  const first = createBarcodeItem(0);
  const second = createBarcodeItem(2);
  const third = createBarcodeItem(3);
  return [
    { ...first, expiresAt: addDays(2) },
    { ...second, expiresAt: addDays(3) },
    { ...third, expiresAt: addDays(10) },
  ];
}
