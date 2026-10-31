import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import App from "../../App";
import {
  emptySnapshot,
  loadCloudInventory,
  parseSnapshot,
  saveCloudInventory,
  supabase,
  type InventorySnapshot,
} from "../../services/cloudInventory";
import {
  inventoryStorageKey,
  localInventoryRepository,
} from "../../services/inventoryRepository";
import { loadFridges, mainFridgeId } from "../../services/fridges";
import "./account.css";

function AccountInventory({ user }: { user: User }) {
  const [loaded, setLoaded] = useState<{
    snapshot: InventorySnapshot;
    revision: number;
    version: number;
  }>();
  const [draft, setDraft] = useState<InventorySnapshot>(emptySnapshot);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Loading your account inventory…");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const dirty =
    !!loaded && JSON.stringify(draft) !== JSON.stringify(loaded.snapshot);
  useEffect(() => {
    let active = true;
    loadCloudInventory(user.id)
      .then((result) => {
        if (!active) return;
        setLoaded({ ...result, version: retry });
        setDraft(result.snapshot);
        setMessage(
          "Account inventory loaded. Save changes before opening another device.",
        );
        setError("");
      })
      .catch((e: Error) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [user.id, retry]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const changed = useCallback((next: InventorySnapshot) => setDraft(next), []);
  async function save() {
    if (!loaded || busy) return;
    setBusy(true);
    setError("");
    try {
      const revision = await saveCloudInventory(
        user.id,
        draft,
        loaded.revision,
      );
      setLoaded({ ...loaded, snapshot: draft, revision });
      setMessage(
        "Saved to your account. Refresh on your other device to load these changes.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function refresh() {
    if (
      dirty &&
      !window.confirm(
        "Discard unsaved changes and load the inventory saved in your account?",
      )
    )
      return;
    setLoaded(undefined);
    setError("");
    setMessage("Loading your account inventory…");
    setRetry((n) => n + 1);
  }
  async function signOut() {
    if (
      dirty &&
      !window.confirm("Sign out and discard unsaved account changes?")
    )
      return;
    const { error: signOutError } = await supabase.auth.signOut({
      scope: "local",
    });
    if (signOutError) setError("Unable to sign out. Please try again.");
  }
  function importLocal() {
    try {
      if (!localStorage.getItem(inventoryStorageKey))
        throw new Error("No saved browser inventory is available to import.");
      const items = localInventoryRepository
        .load()
        .map((item) => ({ ...item, fridgeId: item.fridgeId || mainFridgeId }));
      const snapshot = parseSnapshot(items, loadFridges(items));
      if (
        !window.confirm(
          `Import ${items.length} browser items into your empty account inventory? This may include sample groceries. Review them before saving.`,
        )
      )
        return;
      setDraft(snapshot);
      setLoaded(
        (current) => current && { ...current, version: current.version + 1 },
      );
      setImportSnapshot(snapshot);
      setMessage(
        "Browser items imported for review. Select Save to account to upload them.",
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const [importSnapshot, setImportSnapshot] = useState<InventorySnapshot>();
  return (
    <>
      <section className="account-bar" aria-label="Account storage">
        <p>
          <strong>Account inventory</strong> · {user.email}
        </p>
        <p role="status">{dirty ? "You have unsaved changes." : message}</p>
        {error && <p role="alert">{error}</p>}
        <div className="account-actions">
          <button
            type="button"
            onClick={save}
            disabled={!loaded || busy || (!dirty && loaded.revision > 0)}
          >
            {busy ? "Saving…" : "Save to account"}
          </button>
          <button
            type="button"
            onClick={() => {
              setImportSnapshot(undefined);
              refresh();
            }}
            disabled={busy}
          >
            Refresh from account
          </button>
          {loaded &&
            !loaded.snapshot.items.length &&
            loaded.revision === 0 &&
            !dirty && (
              <button type="button" onClick={importLocal}>
                Import browser inventory
              </button>
            )}
          <button type="button" onClick={signOut} disabled={busy}>
            Sign out
          </button>
        </div>
      </section>
      {loaded && (
        <fieldset className="account-app" disabled={busy}>
          <App
            key={loaded.version}
            skipIntro
            initialData={importSnapshot ?? loaded.snapshot}
            onInventoryChange={changed}
          />
        </fieldset>
      )}
    </>
  );
}

export default function AccountApp({ skipIntro }: { skipIntro: boolean }) {
  const [user, setUser] = useState<User | null>();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null),
    );
    return () => subscription.unsubscribe();
  }, []);
  async function authenticate(create: boolean) {
    setBusy(true);
    setMessage("");
    try {
      const result = create
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}?prototype&skipIntro`,
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) setMessage(result.error.message);
      else {
        setPassword("");
        setMessage(
          create && !result.data.session
            ? "Check your email to confirm your account, then sign in here. If email delivery fails, contact the project owner."
            : "Signed in.",
        );
      }
    } catch {
      setMessage("Unable to connect. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }
  if (user === undefined)
    return (
      <p className="account-bar" role="status">
        Checking account…
      </p>
    );
  if (user) return <AccountInventory key={user.id} user={user} />;
  return (
    <>
      <section className="account-bar" aria-label="Account storage">
        <p>
          <strong>Browser inventory</strong> · Saved on this browser only.
        </p>
        <button type="button" onClick={() => setShowLogin(!showLogin)}>
          {showLogin ? "Close sign in" : "Sign in to save across devices"}
        </button>
        {showLogin && (
          <form
            className="account-form"
            onSubmit={(e) => {
              e.preventDefault();
              void authenticate(false);
            }}
          >
            <p>
              Account storage is currently a project owner pilot. Public
              visitors can use browser inventory. Your CROCS account is separate
              from your Supabase dashboard account. Create a CROCS account here
              the first time.
            </p>
            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                autoComplete="current-password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <div className="account-actions">
              <button disabled={busy} type="submit">
                {busy ? "Please wait…" : "Sign in"}
              </button>
              <button
                disabled={busy || !email || password.length < 8}
                type="button"
                onClick={() => void authenticate(true)}
              >
                Create account
              </button>
            </div>
            <p role="status">{message}</p>
          </form>
        )}
      </section>
      <App skipIntro={skipIntro} />
    </>
  );
}
