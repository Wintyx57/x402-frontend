export const CATEGORIES = [
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

export const CATEGORY_LABELS = {
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

export const VALID_CATEGORIES = CATEGORIES.filter(c => c.tag).map(c => c.tag);
