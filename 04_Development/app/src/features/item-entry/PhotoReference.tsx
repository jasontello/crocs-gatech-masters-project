import { useEffect, useRef, useState } from "react";

export function PhotoReference() {
  const [photo, setPhoto] = useState<File>();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const camera = useRef<HTMLInputElement>(null);
  const upload = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  const select = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP photo.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Choose a photo smaller than 10 MB.");
      return;
    }
    setError("");
    setPhoto(file);
    setUrl(URL.createObjectURL(file));
  };

  return (
    <section className="field-group" aria-labelledby="photo-reference-title">
      <h2 id="photo-reference-title">Photo reference (optional)</h2>
      <p>
        Take or choose a photo, then enter the item details below. Automatic
        recognition is not connected. The photo is only used here and is not
        uploaded or saved with the item.
      </p>
      {photo && url ? (
        <figure style={{ margin: 0 }}>
          <img
            src={url}
            alt="Selected grocery reference"
            style={{ width: "100%", maxHeight: 280, objectFit: "contain" }}
            onError={() => {
              setPhoto(undefined);
              setUrl("");
              setError(
                "This photo could not be opened. Try another JPEG, PNG, or WebP image.",
              );
            }}
          />
          <figcaption>{photo.name}</figcaption>
        </figure>
      ) : null}
      <input
        ref={camera}
        aria-label="Take grocery photo"
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        onChange={(event) => {
          select(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <input
        ref={upload}
        aria-label="Choose grocery photo"
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          select(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        className="secondary-button"
        onClick={() => camera.current?.click()}
      >
        {photo ? "Retake photo" : "Take photo"}
      </button>
      <button
        type="button"
        className="secondary-button"
        onClick={() => upload.current?.click()}
      >
        {photo ? "Replace photo" : "Choose photo"}
      </button>
      {photo ? (
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setPhoto(undefined);
            setUrl("");
            setError("");
          }}
        >
          Remove photo
        </button>
      ) : null}
      {error ? (
        <p role="alert" className="field-error">
          {error}
        </p>
      ) : null}
    </section>
  );
}
