import Dexie, { type Table } from 'dexie';

export interface Food {
  id?: number;
  name: string;
  calories: number;
  protein: number;
  servingName: string;
  usageCount: number;
  lastUsed: number; // timestamp ms
  favorite: boolean;
}

export interface Entry {
  id?: number;
  foodId: number;
  servings: number;
  calories: number;
  protein: number;
  timestamp: number; // ms
  dayKey: string; // YYYY-MM-DD
}

export interface Settings {
  id?: number;
  calorieGoal: number;
  proteinGoal: number;
  themePreference?: ThemePreference;
}

export type ThemePreference = 'system' | 'light' | 'dark';

export const defaultSettings: Omit<Settings, 'id'> = {
  calorieGoal: 2000,
  proteinGoal: 150,
  themePreference: 'system',
};

export class IntakeDB extends Dexie {
  foods!: Table<Food>;
  entries!: Table<Entry>;
  settings!: Table<Settings>;

  constructor() {
    super('IntakeDB');
    this.version(1).stores({
      foods: '++id, name, usageCount, lastUsed, favorite',
      entries: '++id, foodId, dayKey, timestamp',
      settings: '++id',
    });
  }
}

export const db = new IntakeDB();

// Helpers
export async function getSettings(): Promise<Settings> {
  const s = await db.settings.toArray();
  if (s.length > 0) return { ...defaultSettings, ...s[0] };
  const id = await db.settings.add(defaultSettings);
  return { id, ...defaultSettings };
}

export async function saveSettings(s: Partial<Settings>): Promise<void> {
  const existing = await db.settings.toArray();
  if (existing.length > 0) {
    await db.settings.update(existing[0].id!, s);
  } else {
    await db.settings.add({ ...defaultSettings, ...s });
  }
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getEntriesForDay(dayKey: string): Promise<Entry[]> {
  return db.entries.where('dayKey').equals(dayKey).toArray();
}

export async function addEntry(
  food: Food,
  servings: number
): Promise<Entry> {
  const now = Date.now();
  const entry: Entry = {
    foodId: food.id!,
    servings,
    calories: Math.round(food.calories * servings),
    protein: Math.round(food.protein * servings * 10) / 10,
    timestamp: now,
    dayKey: todayKey(),
  };
  entry.id = await db.entries.add(entry);
  // Update food stats
  await db.foods.update(food.id!, {
    usageCount: (food.usageCount || 0) + 1,
    lastUsed: now,
  });
  return entry;
}

export async function deleteEntry(id: number): Promise<void> {
  await db.entries.delete(id);
}

/** Score function for Quick Picks ranking */
export function quickPickScore(food: Food, hourOfDay: number): number {
  const now = Date.now();
  const hourMs = 3600 * 1000;

  // Recency weight (higher = more recent)
  const ageHours = (now - (food.lastUsed || 0)) / hourMs;
  const recencyScore = Math.max(0, 1 - ageHours / (7 * 24)); // decay over 7 days

  // Frequency weight
  const freqScore = Math.min(1, (food.usageCount || 0) / 20);

  // Time-of-day match
  let timeScore = 0;
  if (hourOfDay >= 6 && hourOfDay < 11) {
    // Morning
    timeScore = food.name.toLowerCase().match(/(egg|oat|yogurt|banana|coffee|toast|cereal|fruit|protein shake)/) ? 0.3 : 0;
  } else if (hourOfDay >= 11 && hourOfDay < 16) {
    // Afternoon
    timeScore = food.name.toLowerCase().match(/(salad|sandwich|chicken|rice|lunch|wrap|soup)/) ? 0.3 : 0;
  } else {
    // Evening
    timeScore = food.name.toLowerCase().match(/(dinner|steak|pasta|fish|beef|pork|pizza|burger)/) ? 0.3 : 0;
  }

  // Favorite bonus
  const favBonus = food.favorite ? 0.2 : 0;

  return recencyScore * 0.4 + freqScore * 0.3 + timeScore + favBonus;
}

export async function exportData(): Promise<string> {
  const [foods, entries, settings] = await Promise.all([
    db.foods.toArray(),
    db.entries.toArray(),
    db.settings.toArray(),
  ]);
  return JSON.stringify({ foods, entries, settings }, null, 2);
}

export async function importData(json: string): Promise<void> {
  const data = JSON.parse(json);
  await db.transaction('rw', db.foods, db.entries, db.settings, async () => {
    await db.foods.clear();
    await db.entries.clear();
    await db.settings.clear();
    if (data.foods?.length) await db.foods.bulkAdd(data.foods);
    if (data.entries?.length) await db.entries.bulkAdd(data.entries);
    if (data.settings?.length) await db.settings.bulkAdd(data.settings);
  });
}
