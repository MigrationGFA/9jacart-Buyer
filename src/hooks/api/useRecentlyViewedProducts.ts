import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { recommendationsApi, type RecentlyViewedParams } from "../../api/recommendations";
import { mapRecentlyViewedToProductSummaries, type RecentlyViewedApiItem } from "../../utils/product-mappers";
import { apiErrorUtils } from "../../utils/api-errors";
import type { ProductSummary } from "../../types";

const DEFAULT_LIMIT = 4;

export interface UseRecentlyViewedParams {
  limit?: number;
  vendorId?: string | null;
  categoryId?: string | null;
}

/**
 * Fetches recently viewed products from the recommendations API.
 * Requires authentication; returns empty list when not logged in or on API error.
 */
export function useRecentlyViewedProducts(params: UseRecentlyViewedParams = {}) {
  const { isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = params.limit ?? DEFAULT_LIMIT;
  const vendorId = params.vendorId || undefined;
  const categoryId = params.categoryId || undefined;

  const fetchRecentlyViewed = useCallback(async () => {
    if (!isAuthenticated) {
      setProducts([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiParams: RecentlyViewedParams = { limit };
      if (vendorId) apiParams.vendorId = vendorId;
      if (categoryId) apiParams.categoryId = categoryId;

      const response = await recommendationsApi.getRecentlyViewedProducts(apiParams);
      const raw = Array.isArray(response?.data?.products) ? response.data.products : [];
      const mapped = mapRecentlyViewedToProductSummaries(raw as RecentlyViewedApiItem[]);
      setProducts(mapped);
    } catch (err) {
      const msg = apiErrorUtils.getErrorMessage(err);
      setError(msg);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, limit, vendorId, categoryId]);

  useEffect(() => {
    fetchRecentlyViewed();
  }, [fetchRecentlyViewed]);

  return {
    products,
    loading,
    error,
    isAuthenticated,
    refetch: fetchRecentlyViewed,
  };
}
