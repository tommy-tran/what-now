import { z } from "zod";

const MoodEnum = z.enum(["home", "relaxed", "active"]);        // Mood
const CostEnum = z.enum(["$", "$$", "$$$"]);                    // Cost
const CompEnum = z.enum(["solo", "date", "friends", "family"]); // Companion

// URL shape: ?mood=home&budget=$$&companions=solo,friends&interests=food,cozy
export const FiltersSchema = z.object({
  mood: MoodEnum.default("home"),
  budget: z.union([CostEnum, z.literal("any")]).default("any"),
  companions: z
    .string()
    .transform((s) => (s ? s.split(",") : []))
    .optional()
    .default([])
    .pipe(z.array(CompEnum)),
  interests: z
    .string()
    .transform((s) => (s ? s.split(",") : []))
    .optional()
    .default([])
    .pipe(z.array(z.string())),
});

// Parsed+typed result you’ll pass to the client
export type ParsedFilters = z.infer<typeof FiltersSchema>;

// Helper to encode back to a query string
export function encodeFiltersToQuery(f: ParsedFilters) {
  const params = new URLSearchParams();
  if (f.mood) params.set("mood", f.mood);
  if (f.budget) params.set("budget", f.budget);
  if (f.companions.length) params.set("companions", f.companions.join(","));
  if (f.interests.length) params.set("interests", f.interests.join(","));
  return params.toString();
}
