import { Product } from '../types';

export interface SearchResult {
  product: Product;
  score: number;
  matchType: 'exact' | 'starts-with' | 'contains' | 'fuzzy';
  matchedFields: string[];
}

/**
 * Advanced search algorithm with relevance scoring
 * Prioritizes:
 * 1. Exact matches in name
 * 2. Starts with matches
 * 3. Contains matches
 * 4. Fuzzy matches
 * 5. Brand and description matches
 */
export function searchProducts(query: string, products: Product[], maxResults: number = 10): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
  
  const results: SearchResult[] = [];

  for (const product of products) {
    const name = (product.name || '').toLowerCase();
    const brand = (product.brand || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    const category = (product.category || '').toLowerCase();
    
    let score = 0;
    let matchType: SearchResult['matchType'] = 'fuzzy';
    const matchedFields: string[] = [];

    // Exact match in name (highest priority)
    if (name === normalizedQuery) {
      score += 1000;
      matchType = 'exact';
      matchedFields.push('name');
    }
    // Name starts with query
    else if (name.startsWith(normalizedQuery)) {
      score += 500;
      matchType = 'starts-with';
      matchedFields.push('name');
    }
    // Name contains query
    else if (name.includes(normalizedQuery)) {
      score += 300;
      matchType = 'contains';
      matchedFields.push('name');
    }
    // Fuzzy match in name (Levenshtein-like)
    else if (fuzzyMatch(name, normalizedQuery)) {
      score += 100;
      matchType = 'fuzzy';
      matchedFields.push('name');
    }

    // Word-by-word matching (for multi-word queries)
    let wordMatches = 0;
    for (const word of queryWords) {
      if (name.includes(word)) {
        wordMatches++;
        score += 50;
        if (!matchedFields.includes('name')) matchedFields.push('name');
      } else if (brand.includes(word)) {
        wordMatches++;
        score += 30;
        if (!matchedFields.includes('brand')) matchedFields.push('brand');
      } else if (description.includes(word)) {
        wordMatches++;
        score += 20;
        if (!matchedFields.includes('description')) matchedFields.push('description');
      } else if (category.includes(word)) {
        wordMatches++;
        score += 15;
        if (!matchedFields.includes('category')) matchedFields.push('category');
      }
    }

    // Bonus for matching all words
    if (wordMatches === queryWords.length && queryWords.length > 1) {
      score += 50;
    }

    // Brand exact match bonus
    if (brand === normalizedQuery) {
      score += 200;
      if (!matchedFields.includes('brand')) matchedFields.push('brand');
    } else if (brand.includes(normalizedQuery)) {
      score += 100;
      if (!matchedFields.includes('brand')) matchedFields.push('brand');
    }

    // Description contains query
    if (description.includes(normalizedQuery)) {
      score += 50;
      if (!matchedFields.includes('description')) matchedFields.push('description');
    }

    // Category match
    if (category.includes(normalizedQuery)) {
      score += 30;
      if (!matchedFields.includes('category')) matchedFields.push('category');
    }

    // In-stock bonus
    if (product.inStock) {
      score += 10;
    }

    // Rating bonus (higher rated products get slight boost)
    score += product.rating * 2;

    if (score > 0) {
      results.push({
        product,
        score,
        matchType,
        matchedFields
      });
    }
  }

  // Sort by score (highest first), then by name
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.product.name.localeCompare(b.product.name);
  });

  return results.slice(0, maxResults);
}

/**
 * Simple fuzzy matching using character similarity
 * Returns true if strings are similar enough
 */
function fuzzyMatch(str: string, query: string): boolean {
  if (query.length < 2) return false;
  
  // Check if query characters appear in order in the string
  let queryIndex = 0;
  for (let i = 0; i < str.length && queryIndex < query.length; i++) {
    if (str[i] === query[queryIndex]) {
      queryIndex++;
    }
  }
  
  // If we matched at least 70% of query characters, consider it a match
  return queryIndex >= Math.ceil(query.length * 0.7);
}

/**
 * Get search suggestions based on query
 * Returns unique product names, brands, and categories that match
 */
export function getSearchSuggestions(query: string, products: Product[], maxSuggestions: number = 8): string[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const suggestions = new Set<string>();

  for (const product of products) {
    const name = (product.name || '').toLowerCase();
    const brand = (product.brand || '').toLowerCase();
    const category = (product.category || '').toLowerCase();

    // Add product name if it matches
    if (name.includes(normalizedQuery) && product.name) {
      suggestions.add(product.name);
    }

    // Add brand if it matches
    if (brand.includes(normalizedQuery) && product.brand) {
      suggestions.add(product.brand);
    }

    // Add category if it matches
    if (category.includes(normalizedQuery) && product.category) {
      suggestions.add(product.category);
    }

    // Check if query matches any word in the name
    const nameWords = name.split(/\s+/);
    for (const word of nameWords) {
      if (word.startsWith(normalizedQuery) && word.length > normalizedQuery.length) {
        suggestions.add(word.charAt(0).toUpperCase() + word.slice(1));
      }
    }

    if (suggestions.size >= maxSuggestions) break;
  }

  return Array.from(suggestions).slice(0, maxSuggestions);
}

