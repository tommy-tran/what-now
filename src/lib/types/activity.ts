// Mood is our energy-intent dial for the day.
export type Mood = "home" | "relaxed" | "active";

// Who you might do the activity with
export type Companion = "solo" | "date" | "friends" | "family";

// Dollar signs as an easy budget indicator
export type Cost = "$" | "$$" | "$$$";

// Activity - core entity
export type Activity = {
    id: string;
    title: string;
    description: string;
    mood: Mood[];
    companions: Companion[];
    cost: Cost;
    interests: string[];
}

export type Filters = {
    mood: Mood;
    budget: Cost | "any";
    companions: Companion[];
    interests: string[];
}