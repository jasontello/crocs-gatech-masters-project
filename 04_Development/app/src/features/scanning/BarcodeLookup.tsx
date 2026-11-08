import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ItemInput } from "../../types/inventory";

export function BarcodeLookup({
  onMatch,
}: {
  onMatch: (item: ItemInput) => void;
}) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  async function lookup(event: FormEvent) {
    event.preventDefault();
    if (active.current) return;
    const barcode = code.trim();
    if (!/^(?:\d{8}|\d{12,14})$/.test(barcode)) {
      setMessage("Enter 8, 12, 13, or 14 barcode digits.");
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    setLoading(true);
    setMessage("Looking up product…");
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name`,
        {
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(10000),
          ]),
        },
      );
      if (response.status === 404) {
        setMessage("No product found. Check the digits or use Manual.");
        return;
      }
      if (!response.ok) throw new Error("Lookup unavailable");
      const data = await response.json();
      const name = data.product?.product_name?.trim();
      if (data.status !== 1 || !name) {
        setMessage("No product name found. Check the digits or use Manual.");
        return;
      }
      onMatch({ name, barcode });
    } catch {
      if (!controller.signal.aborted)
        setMessage("Lookup unavailable. Try again or use Manual.");
    } finally {
      active.current = null;
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={lookup}>
      <div className="field-group">
        <label htmlFor="package-barcode">Package barcode</label>
        <input
          id="package-barcode"
          inputMode="numeric"
          value={code}
          disabled={loading}
          onChange={(event) => {
            setCode(event.target.value);
            setMessage("");
          }}
        />
      </div>
      <button className="secondary-button" disabled={loading}>
        Look up product
      </button>
      <span>
        Product data from{" "}
        <a href="https://world.openfoodfacts.org/">Open Food Facts</a>
      </span>
      <span role="status">{message}</span>
    </form>
  );
}
