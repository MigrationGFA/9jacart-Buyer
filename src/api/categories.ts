import { apiClient } from './client';

// Categories API request types
export interface CategoriesListParams {
  page?: number;
  perPage?: number;
}

// Categories API response types (matching the actual API structure)
export interface ApiCategoryData {
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesListResponse {
  status: number;
  error: boolean;
  message: string;
  data: ApiCategoryData[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  };
}

// Categories API endpoints
export const categoriesApi = {
  // Get categories list (uses Basic Auth)
  getCategories: async (params: CategoriesListParams = {}): Promise<CategoriesListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.perPage) searchParams.append('perPage', params.perPage.toString());
    
    const queryString = searchParams.toString();
    const endpoint = `/product/category${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<CategoriesListResponse>(endpoint, undefined, false); // Use Basic Auth
  },
};