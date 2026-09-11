import { useEffect, useRef, useState, type FormEvent } from "react";
import { ScreenLayout } from "../../components/ScreenLayout";
import type { ItemInput } from "../../types/inventory";

interface ManualEntryFormProps {
  title: string;
  intro: string;
  submitLabel: string;
  initialValues?: ItemInput;
  onSubmit: (input: ItemInput) => void;
  onCancel: () => void;
}

const EMPTY_INPUT: ItemInput = {
  name: "",
  quantity: "",
  expiresAt: "",
  notes: "",
};

export function ManualEntryForm({
  title,
  intro,
  submitLabel,
  initialValues,
  onSubmit,
  onCancel,
}: ManualEntryFormProps) {
  const [values, setValues] = useState<ItemInput>({
    ...EMPTY_INPUT,
    ...initialValues,
  });
  const [nameError, setNameError] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const setField = (field: keyof ItemInput, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (field === "name" && value.trim()) setNameError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.name.trim()) {
      setNameError("Enter an item name before saving.");
      nameInputRef.current?.focus();
      return;
    }

    onSubmit({
      name: values.name.trim(),
      quantity: values.quantity?.trim() || undefined,
      expiresAt: values.expiresAt || undefined,
      notes: values.notes?.trim() || undefined,
    });
  };

  return (
    <ScreenLayout title={title} intro={intro} onBack={onCancel} backLabel="Cancel">
      <form className="form-stack" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="item-name">Item name *</label>
          <input
            ref={nameInputRef}
            id="item-name"
            name="itemName"
            type="text"
            autoComplete="off"
            placeholder="e.g., Greek yogurt"
            value={values.name}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "item-name-error" : undefined}
            onChange={(event) => setField("name", event.target.value)}
          />
          {nameError ? (
            <p className="field-error" id="item-name-error">
              {nameError}
            </p>
          ) : null}
        </div>

        <div className="field-group">
          <label htmlFor="item-quantity">Quantity</label>
          <input
            id="item-quantity"
            name="quantity"
            type="text"
            placeholder="e.g., 1 bag"
            value={values.quantity}
            onChange={(event) => setField("quantity", event.target.value)}
          />
        </div>

        <div className="field-group">
          <label htmlFor="item-expiration">Package date or use-first date</label>
          <input
            id="item-expiration"
            name="expiration"
            type="date"
            value={values.expiresAt}
            onChange={(event) => setField("expiresAt", event.target.value)}
          />
        </div>

        <div className="field-group">
          <label htmlFor="item-notes">Storage note (optional)</label>
          <textarea
            id="item-notes"
            name="notes"
            rows={3}
            placeholder="Add a short note"
            value={values.notes}
            onChange={(event) => setField("notes", event.target.value)}
          />
        </div>

        <button className="primary-button" type="submit">
          {submitLabel}
        </button>
        <button className="secondary-button" type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </ScreenLayout>
  );
}
