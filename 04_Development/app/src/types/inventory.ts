export type EntryMethod = "manual" | "barcode" | "camera" | "upload";

export type RecognitionOutcome =
  | "confirmed"
  | "corrected"
  | "rejected"
  | "failed"
  | null;

export type IdentificationStatus = "identified" | "likely-match" | "needs-review";
export type DateType = "estimated" | "recommended" | "confirmed" | "needs-confirmation";
export type RecommendationConfidence = "high" | "medium" | "low";

export interface InventoryItem {
  id: string;
  name: string;
  brand?: string;
  packageSize?: string;
  quantity?: string;
  addedAt: string;
  expiresAt?: string;
  notes?: string;
  entryMethod: EntryMethod;
  recognitionOutcome: RecognitionOutcome;
  originalSuggestion?: string;
  identificationStatus?: IdentificationStatus;
  dateType?: DateType;
  estimateBasis?: string;
  printedDateLabel?: string;
  recommendationSourceName?: string;
  recommendationSourceUrl?: string;
  recommendationConfidence?: RecommendationConfidence;
  reasoningSummary?: string;
  openedAt?: string;
  continuouslyRefrigerated?: boolean;
  aiAssisted?: boolean;
  barcode?: string;
  productImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemInput {
  name: string;
  brand?: string;
  packageSize?: string;
  quantity?: string;
  expiresAt?: string;
  notes?: string;
}
