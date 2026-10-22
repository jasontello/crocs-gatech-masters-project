import { useState } from "react";
import { validateFridgeName, type Fridge } from "../services/fridges";

interface Props {
  fridges: Fridge[];
  selectedId: string;
  intake: boolean;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
}
export function FridgePicker({
  fridges,
  selectedId,
  intake,
  onSelect,
  onCreate,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  return (
    <section className="fridge-picker" aria-label="Fridge selection">
      <div className="fridge-picker-row">
        <label htmlFor="active-fridge">
          {intake ? "Add batch to" : "Current fridge"}
        </label>
        <select
          id="active-fridge"
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
        >
          {fridges.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setCreating(!creating)}
          aria-expanded={creating}
        >
          New fridge
        </button>
      </div>
      {creating && (
        <form
          className="fridge-create"
          onSubmit={(e) => {
            e.preventDefault();
            const problem = validateFridgeName(name, fridges);
            setError(problem);
            if (problem) return;
            onCreate(name.trim());
            setName("");
            setCreating(false);
          }}
        >
          <label htmlFor="new-fridge-name">Fridge name</label>
          <input
            id="new-fridge-name"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            aria-describedby={error ? "fridge-error" : undefined}
            aria-invalid={!!error}
          />
          {error && (
            <p id="fridge-error" role="alert">
              {error}
            </p>
          )}
          <div className="button-row">
            <button className="primary-button" type="submit">
              Create fridge
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setCreating(false);
                setError(undefined);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
