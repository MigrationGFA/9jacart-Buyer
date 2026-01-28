import { apiClient } from "./client";

export interface RecentlyViewedParams {
  limit?: number;
  vendorId?: string;
  categoryId?: string;
}

/** API response for recently viewed products. */
export interface RecentlyViewedSummary {
  totalViewed?: number;
  uniqueProducts?: number;
  uniqueVendors?: number;
  uniqueCategories?: number;
}

/** Recently-viewed API returns a different product shape than main products API. */
export interface RecentlyViewedResponse {
  status?: number;
  error?: boolean;
  message?: string;
  data?: {
    products?: unknown[];
    summary?: RecentlyViewedSummary;
    filters?: unknown;
  };
}

/**
 * GET Recently Viewed Products.
 * Requires Bearer token authentication.
 * @see https://api.9jacart.ng/buyer/recommendations/recently-viewed-products
 */
export const recommendationsApi = {
  getRecentlyViewedProducts: async (
    params: RecentlyViewedParams = {}
  ): Promise<RecentlyViewedResponse> => {
    const searchParams = new URLSearchParams();

    if (params.limit != null)
      searchParams.append("limit", params.limit.toString());
    if (params.vendorId) searchParams.append("vendorId", params.vendorId);
    if (params.categoryId) searchParams.append("categoryId", params.categoryId);

    const queryString = searchParams.toString();
    const endpoint = `/buyer/recommendations/recently-viewed-products${
      queryString ? `?${queryString}` : ""
    }`;

    return apiClient.get<RecentlyViewedResponse>(endpoint, undefined, true);
  },
};
