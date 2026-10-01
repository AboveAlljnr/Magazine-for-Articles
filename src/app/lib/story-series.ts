// Editorial reading order, independent of publication dates and pagination.
// Only published chapters are fetched by the public components.
export const storySeries = [
  { slug: 'kayla-between-two-months', title: 'Kayla’s thoughts between two months', description: 'Reflections on identity, conviction, growth, and finding your way.', articles: [
    'kaylas-thoughts-between-two-months', 'kaylas-thoughts-between-two-months-b7a',
    'kaylas-thoughts-between-two-months-211', 'kaylas-thoughts-between-two-months-f91',
    'kaylas-thoughts-between-two-months-6cf', 'kaylas-thoughts-between-two-months-7e3',
    'kaylas-thoughts-between-two-months-fa5',
  ] },
  { slug: 'kayla-in-ho', title: 'Kayla in Ho', description: 'Campus life, belonging, and everyday discoveries in Ho.', articles: ['day-1-kayla-in-ho-meet-my-school'] },
];

export function orderSeriesChapters<T extends { slug: string }>(order: string[], rows: T[]): T[] {
  const bySlug = new Map(rows.map(row => [row.slug, row]));
  return order.flatMap(slug => bySlug.has(slug) ? [bySlug.get(slug)!] : []);
}
