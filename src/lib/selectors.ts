import type { AppData, Category } from '../types'

/** Active categories in display order. */
export function activeCategories(data: AppData): Category[] {
  return data.categories.filter((c) => c.active).sort((a, b) => a.order - b.order)
}

export function archivedCategories(data: AppData): Category[] {
  return data.categories
    .filter((c) => !c.active)
    .sort((a, b) => (a.archivedAt ?? '') < (b.archivedAt ?? '') ? 1 : -1)
}

export function categoryMap(data: AppData): Map<string, Category> {
  return new Map(data.categories.map((c) => [c.id, c]))
}

/**
 * Categories to show for a saved entry: the entry's own score keys, ordered by
 * current category order, including archived categories (historical records
 * keep them). Unknown ids (from partial imports) get a placeholder.
 */
export function categoriesForEntry(
  data: AppData,
  scores: Record<string, number>,
): { category: Category | null; id: string; score: number }[] {
  const map = categoryMap(data)
  return Object.entries(scores)
    .map(([id, score]) => ({ id, score, category: map.get(id) ?? null }))
    .sort((a, b) => (a.category?.order ?? 999) - (b.category?.order ?? 999))
}

export function categoryDisplayName(category: Category | null): string {
  return category ? category.name : 'Removed category'
}
