import type { Activity, Filters } from "@/lib/types/activity";

export function scoreActivity(activity: Activity, filters: Filters): number {
  let score = 0;

  if (activity.mood.includes(filters.mood)) score += 3;
  if (filters.budget === "any" || activity.cost === filters.budget) score += 1;
  if (filters.companions.some((c) => activity.companions.includes(c))) score += 1;

  const overlap = activity.interests.filter((t) => filters.interests.includes(t)).length;
  score += overlap * 2;

  return score;
}

export function rankActivities(activities: Activity[], filters: Filters, take: number = 6) {
  return activities
    .map((a) => ({ a, s: scoreActivity(a, filters) }))
    .sort((x, y) => y.s - x.s)
    .slice(0, take)
    .map(({ a }) => a);
}
