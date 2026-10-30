// One category → color map for the whole site (home grid, /blog index,
// article page accents). Home filter chips read FILTER_CATEGORIES from here.

export const CATEGORY_COLORS: Record<string, string> = {
  Investing: '#30D158',
  Gaming: '#BF5AF2',
  Science: '#64D2FF',
  'Mental Models': '#FFB340',
  Curiosity: '#FF6FB5',
  // Covered on /blog and article pages; kept so those surfaces don't regress.
  AI: '#c084fc',
  Travel: '#fb923c',
  Engineering: '#38bdf8',
  Economics: '#34d399',
};

export const FILTER_CATEGORIES = [
  'All',
  'Investing',
  'Gaming',
  'Science',
  'Mental Models',
  'Curiosity',
] as const;

export const DEFAULT_CATEGORY_COLOR = '#0aee3c';

export function categoryColor(category?: string | null): string {
  if (!category) return DEFAULT_CATEGORY_COLOR;
  return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_COLOR;
}
