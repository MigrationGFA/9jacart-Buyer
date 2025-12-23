/**
 * ARCHIVED: Product Ratings Hook
 * 
 * This file contains the archived useProductRatings hook.
 * Archived on: 2025-12-23
 * 
 * To restore:
 * 1. Copy this file back to src/hooks/api/useProductRatings.ts
 * 2. Restore getProductRatings import from src/api/products.ts
 * 3. Restore usage in ProductCard.tsx and ProductDetailPage.tsx
 */

import { useState, useEffect, useCallback } from 'react';
// import { productsApi } from '../../../api/products'; // Archived - no longer used
import type { ProductReviews } from '../../../types';

interface UseProductRatingsResult {
  reviews: ProductReviews | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch product ratings from the API
 * @param productId - The product ID to fetch ratings for
 * @param enabled - Whether to fetch ratings (default: true)
 */
export const useProductRatings = (
  productId: string | null | undefined,
  enabled: boolean = true
): UseProductRatingsResult => {
  const [reviews, setReviews] = useState<ProductReviews | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = useCallback(async () => {
    if (!productId || !enabled) {
      setReviews(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // NOTE: getProductRatings method no longer exists in productsApi
      // This archived hook is kept for reference only
      // const response = await productsApi.getProductRatings(productId);
      
      // If API returns error or no data, set to null (will use fallback)
      setReviews(null);
    } catch (err: any) {
      // Silently handle errors - API endpoint may not exist yet
      // Component will use fallback ratings from product.reviews
      setReviews(null);
      setError(null); // Don't set error state to avoid console spam
    } finally {
      setLoading(false);
    }
  }, [productId, enabled]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchRatings,
  };
};

