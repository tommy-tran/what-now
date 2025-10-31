import FiltersPanel from "./FiltersPanel";
import { FiltersSchema, type ParsedFilters } from "@/lib/schemas/filters";

export const metadata = {
  title: "Gather Ideas — Plan Generator",
  description: "Quick activity suggestions by mood, budget, companions, and interests.",
};

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };

export default function GatherPage({ searchParams = {} }: PageProps) {
  // Normalize to simple strings (App Router can give string|string[])
  const raw = {
    mood: typeof searchParams.mood === "string" ? searchParams.mood : undefined,
    budget: typeof searchParams.budget === "string" ? searchParams.budget : undefined,
    companions: typeof searchParams.companions === "string" ? searchParams.companions : undefined,
    interests: typeof searchParams.interests === "string" ? searchParams.interests : undefined,
  };

  // Safe runtime parse -> defaults if invalid/missing
  const parsed: ParsedFilters = FiltersSchema.parse(raw);

  return (
    <main className="min-h-[80vh] p-6 text-neutral-100 bg-neutral-950">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Gather Ideas — Plan Generator</h1>
        <p className="mt-2 text-neutral-300">
          Tune your mood, budget, companions, and interests to get ranked suggestions.
        </p>

        <div className="mt-6">
          <FiltersPanel initialFilters={parsed} />
        </div>
      </div>
    </main>
  );
}
