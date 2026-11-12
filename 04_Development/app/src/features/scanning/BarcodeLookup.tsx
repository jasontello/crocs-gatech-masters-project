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
  const [reading, setReading] = useState(false);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  async function scanPhoto(file: File) {
    setReading(true);
    setCode("");
    setMessage("Reading barcode…");
    try {
      const { readPackageBarcode } = await import("./readPackageBarcode");
      setCode(await readPackageBarcode(file));
      setMessage("Barcode found. Check the digits and select Look up product.");
    } catch {
      setMessage(
        "Could not read the barcode. Try a clear photo with the bars upright, or type the digits below.",
      );
    } finally {
      setReading(false);
    }
  }

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
        <label htmlFor="barcode-photo">Scan a barcode photo</label>
        <input
          id="barcode-photo"
          type="file"
          accept="image/*"
          capture="environment"
          disabled={loading || reading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void scanPhoto(file);
          }}
        />
        <small>Photograph the whole barcode with the bars upright.</small>
      </div>
      <div className="field-group">
        <label htmlFor="package-barcode">Package barcode</label>
        <input
          id="package-barcode"
          inputMode="numeric"
          value={code}
          disabled={loading || reading}
          onChange={(event) => {
            setCode(event.target.value);
            setMessage("");
          }}
        />
      </div>
      <button className="secondary-button" disabled={loading || reading}>
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
