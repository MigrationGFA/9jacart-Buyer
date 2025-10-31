import { useState, useEffect, useCallback, useRef } from "react";
import { categoriesApi, type CategoriesListParams } from "../../api/categories";
import {
  mapApiCategoriesToCategories,
  combineWithServicesCategories,
} from "../../utils/category-mappers";
import { apiErrorUtils } from "../../utils/api-errors";
import type { Category } from "../../types";

// Hook for fetching real categories list
export const useRealCategories = (initialParams: CategoriesListParams = {}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalItems: 0,
  });

  const hasFetchedRef = useRef(false); // Prevent double fetching in StrictMode

  const fetchCategories = useCallback(
    async (params: CategoriesListParams = {}) => {
      console.log("🚀 Fetching categories:", { ...initialParams, ...params });
      setLoading(true);
      setError(null);

      try {
        const mergedParams = { ...initialParams, ...params };
        const response = await categoriesApi.getCategories(mergedParams);

        // Map API response to internal types
        const mappedCategories = mapApiCategoriesToCategories(response.data);
        
        // Combine with services categories
        const allCategories = combineWithServicesCategories(mappedCategories);

        setCategories(allCategories);
        setPagination(response.pagination);
        console.log("✅ Loaded", allCategories.length, "categories (including services)");
      } catch (err) {
        const errorMessage = apiErrorUtils.getErrorMessage(err);
        setError(errorMessage);
        console.error("❌ Failed to fetch categories:", errorMessage);
        
        // Fallback to services categories only if API fails
        const servicesOnly = combineWithServicesCategories([]);
        setCategories(servicesOnly);
        console.log("🔄 Fallback: Using services categories only");
      } finally {
        setLoading(false);
      }
    },
    [] // Remove initialParams dependency to prevent infinite loops
  );

  // Load categories on mount
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchCategories(initialParams);
    }
  }, []); // Empty dependency array to run only once

  const refetch = useCallback(
    (params?: CategoriesListParams) => {
      return fetchCategories(params || initialParams);
    },
    [fetchCategories, initialParams]
  );

  // Helper to get main categories (level 1)
  const getMainCategories = useCallback(() => {
    return categories.filter(cat => cat.level === 1);
  }, [categories]);

  // Helper to get subcategories for a parent
  const getSubcategories = useCallback((parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId);
  }, [categories]);

  // Helper to get services subcategories
  const getServicesSubcategories = useCallback(() => {
    return getSubcategories("services");
  }, [getSubcategories]);

  return {
    categories,
    loading,
    error,
    pagination,
    refetch,
    // Helper functions
    getMainCategories,
    getSubcategories,
    getServicesSubcategories,
  };
};

// Hook for getting all categories (fetch all pages) - Stable version
export const useAllRealCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const fetchAllCategories = useCallback(async () => {
    if (hasFetchedRef.current) return; // Prevent multiple calls
    
    console.log("🚀 Fetching all categories (stable version)");
    setLoading(true);
    setError(null);

    try {
      hasFetchedRef.current = true; // Set before API call
      const response = await categoriesApi.getCategories({ page: 1, perPage: 100 });

      // Map API response to internal types
      const mappedCategories = mapApiCategoriesToCategories(response.data);
      
      // Combine with services categories
      const allCategories = combineWithServicesCategories(mappedCategories);

      setCategories(allCategories);
      console.log("✅ Loaded", allCategories.length, "categories (stable version)");
    } catch (err) {
      const errorMessage = apiErrorUtils.getErrorMessage(err);
      setError(errorMessage);
      console.error("❌ Failed to fetch categories (stable version):", errorMessage);
      
      // Fallback to services categories only if API fails
      const servicesOnly = combineWithServicesCategories([]);
      setCategories(servicesOnly);
      console.log("🔄 Fallback: Using services categories only (stable version)");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load categories on mount - only once
  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  // Helper functions
  const getMainCategories = useCallback(() => {
    return categories.filter(cat => cat.level === 1);
  }, [categories]);

  const getSubcategories = useCallback((parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId);
  }, [categories]);

  const getServicesSubcategories = useCallback(() => {
    return getSubcategories("services");
  }, [getSubcategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchAllCategories,
    getMainCategories,
    getSubcategories,
    getServicesSubcategories,
  };
};