interface Category {
  key: string;
  tag: string | null;
}

export const CATEGORIES: Category[] = [
  { key: 'all', tag: null },
  { key: 'ai', tag: 'ai' },
  { key: 'finance', tag: 'finance' },
  { key: 'data', tag: 'data' },
  { key: 'developer', tag: 'developer' },
  { key: 'media', tag: 'media' },
  { key: 'security', tag: 'security' },
  { key: 'location', tag: 'location' },
  { key: 'communication', tag: 'communication' },
  { key: 'seo', tag: 'seo' },
  { key: 'scraping', tag: 'scraping' },
  { key: 'fun', tag: 'fun' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  all: 'categoryAll',
  ai: 'categoryAi',
  finance: 'categoryFinance',
  data: 'categoryData',
  developer: 'categoryDeveloper',
  media: 'categoryMedia',
  security: 'categorySecurity',
  location: 'categoryLocation',
  communication: 'categoryCommunication',
  seo: 'categorySeo',
  scraping: 'categoryScraping',
  fun: 'categoryFun',
};

export type CategoryKey = 'ai' | 'finance' | 'data' | 'developer' | 'media' | 'security' | 'location' | 'communication' | 'seo' | 'scraping' | 'fun';

export const VALID_CATEGORIES = CATEGORIES.filter(c => c.tag).map(c => c.tag) as CategoryKey[];
