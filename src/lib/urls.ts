/**
 * Builds archive URLs in a stable order: q first, then forum. With neither, the home page.
 */
export function searchPath(term?: string, forum?: string): string {
  const parameters: string[] = [];
  if (term) parameters.push(`q=${encodeURIComponent(term)}`);
  if (forum) parameters.push(`forum=${encodeURIComponent(forum)}`);
  return parameters.length > 0 ? `/search?${parameters.join('&')}` : '/';
}
