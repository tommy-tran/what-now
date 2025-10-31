"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Companion, Cost, Filters, Mood } from "@/lib/types/activity";
import { CATALOG } from "@/data/catalog";
import { rankActivities } from "@/lib/scoring/scoreActivity";
import { encodeFiltersToQuery } from "@/lib/schemas/filters";
import { useDebouncedEffect } from "@/lib/hooks/useDebouncedEffect";

type Props = {
  initialFilters: {
    mood: Mood;
    budget: Cost | "any";
    companions: Companion[];
    interests: string[];
  };
};

const INTERESTS = ["cozy","food","movies","games","nostalgia","nature","wellness","learning","culture","fitness","photography","community","talk"] as const;
const COMPANIONS: Companion[] = ["solo","date","friends","family"];
const BUDGETS: ReadonlyArray<Cost> = ["$","$$","$$$"];
const MOODS: Mood[] = ["home","relaxed","active"];

export default function FiltersPanel({ initialFilters }: Props) {
  // 1) Hydrate from server-validated defaults
  const [mood, setMood] = useState<Mood>(initialFilters.mood);
  const [budget, setBudget] = useState<Cost | "any">(initialFilters.budget);
  const [companions, setCompanions] = useState<Companion[]>(initialFilters.companions);
  const [interests, setInterests] = useState<string[]>(
    initialFilters.interests.length ? initialFilters.interests : ["cozy","food"]
  );

  // 2) Derived filters object (typed)
  const filters: Filters = useMemo(
    () => ({ mood, budget, companions, interests }),
    [mood, budget, companions, interests]
  );

  // 3) Ranked results from pure function
  const results = useMemo(() => rankActivities(CATALOG, filters, 6), [filters]);

  // 4) Keep the URL in sync (debounced), replacing history so Back isn’t spammy
  const router = useRouter();
  const pathname = usePathname();

  useDebouncedEffect(() => {
    const q = encodeFiltersToQuery({ mood, budget, companions, interests });
    const url = q ? `${pathname}?${q}` : pathname;
    router.replace(url, { scroll: false });
  }, [pathname, router, mood, budget, companions, interests], 150);

  // --- render (unchanged UI) ---
  return (
    <section className="grid md:grid-cols-3 gap-4">
      {/* Controls */}
      <div className="md:col-span-1">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-4">
          <h2 className="text-lg font-medium">Preferences</h2>

          {/* Mood */}
          <div className="mt-4">
            <label className="block text-sm mb-2" id="mood-label">Mood</label>
            <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="mood-label">
              {MOODS.map((m) => {
                const label = m === "home" ? "Home" : m === "relaxed" ? "Relaxed" : "Active";
                const selected = mood === m;
                return (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setMood(m)}
                    className={`px-3 py-2 rounded-2xl border text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${
                      selected ? "bg-white text-black border-white" : "border-neutral-700 hover:border-neutral-500"
                    }`}
                    aria-label={label}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget */}
          <div className="mt-4">
            <span className="block text-sm mb-2">Budget</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Budget">
              {["any", ...BUDGETS].map((b) => {
                const selected = budget === b;
                return (
                  <button
                    key={b.toString()}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setBudget(b as any)}
                    className={`px-3 py-1.5 rounded-xl border text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${
                      selected ? "bg-white text-black border-white" : "border-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    {b.toString()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Companions */}
          <div className="mt-4">
            <span className="block text-sm mb-2">Companions</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Companions">
              {COMPANIONS.map((c) => {
                const on = companions.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setCompanions((prev) => (on ? prev.filter((x) => x !== c) : [...prev, c]))
                    }
                    className={`px-3 py-1.5 rounded-xl border text-sm capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${
                      on ? "bg-white text-black border-white" : "border-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests */}
          <div className="mt-4">
            <span className="block text-sm mb-2">Interests</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Interests">
              {INTERESTS.map((tag) => {
                const on = interests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setInterests((prev) => (on ? prev.filter((t) => t !== tag) : [...prev, tag]))
                    }
                    className={`px-3 py-1.5 rounded-xl border text-sm capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${
                      on ? "bg-white text-black border-white" : "border-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-3 text-xs text-neutral-400">Tip: toggle 5–7 interests for better matches.</p>
        </div>
      </div>

      {/* Results */}
      <div className="md:col-span-2">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-4">
          <h2 className="text-lg font-medium">Suggested Plans</h2>

          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            {results.map((a) => (
              <div key={a.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{a.title}</h3>
                  <span className="text-xs text-neutral-400">{a.cost}</span>
                </div>
                <p className="text-sm text-neutral-300 mt-1">{a.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-300">
                  <Badge>{a.mood.includes("home") ? "Home" : a.mood.includes("active") ? "Active" : "Relaxed"}</Badge>
                  {a.interests.slice(0, 3).map((t) => (
                    <Badge key={t} subtle>{t}</Badge>
                  ))}
                </div>
                <p className="mt-3 text-xs text-neutral-400">
                  Why this: matches mood, {a.cost} budget, and{" "}
                  {a.interests.filter((t) => interests.includes(t)).slice(0, 2).join(", ") || "general vibes"}.
                </p>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1.5 rounded-xl bg-white text-black text-sm">Save</button>
                  <button className="px-3 py-1.5 rounded-xl border border-neutral-700 text-sm hover:border-neutral-500">
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {results.length === 0 && (
            <p className="mt-3 text-sm text-neutral-400">No matches. Try broadening filters.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function Badge({ children, subtle = false }: React.PropsWithChildren<{ subtle?: boolean }>) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[11px] ${
        subtle ? "bg-neutral-800 text-neutral-300 border border-neutral-800" : "bg-white text-black"
      }`}
    >
      {children}
    </span>
  );
}
