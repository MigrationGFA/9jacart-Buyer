import { useState, useEffect, useCallback, useRef } from "react";
import { productsApi, type ProductsListParams } from "../../api/products";
import {
  mapApiProductsToProductSummaries,
  mapApiProductToProduct,
} from "../../utils/product-mappers";
import { apiErrorUtils } from "../../utils/api-errors";
import type { Product, ProductSummary } from "../../types";

// Hook for fetching real products list
export const useRealProductsList = (initialParams: ProductsListParams = {}) => {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalItems: 0,
  });

  const hasFetchedRef = useRef(false); // Prevent double fetching in StrictMode

  const fetchProducts = useCallback(
    async (params: ProductsListParams = {}) => {
      console.log("🚀 Fetching products:", { ...initialParams, ...params });
      setLoading(true);
      setError(null);

      try {
        const mergedParams = { ...initialParams, ...params };
        const response = await productsApi.getProducts(mergedParams);

        // Map API response to internal types
        const mappedProducts = mapApiProductsToProductSummaries(response.data);

        setProducts(mappedProducts);
        setPagination(response.pagination);
        console.log("✅ Loaded", mappedProducts.length, "products");
      } catch (err) {
        const errorMessage = apiErrorUtils.getErrorMessage(err);
        setError(errorMessage);
        console.error("❌ Failed to fetch products:", errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [initialParams]
  ); // Remove dependency to prevent re-fetching

  // Load products on mount
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProducts();
    }
  }, [fetchProducts]);

  const refetch = useCallback(
    (params?: ProductsListParams) => {
      return fetchProducts(params);
    },
    [fetchProducts]
  );

  const loadMore = useCallback(async () => {
    if (pagination.currentPage < pagination.totalPages && !loading) {
      setLoading(true);
      try {
        const nextPage = pagination.currentPage + 1;
        const mergedParams = { ...initialParams, page: nextPage };
        const response = await productsApi.getProducts(mergedParams);

        // Map and append new products
        const newMappedProducts = mapApiProductsToProductSummaries(
          response.data
        );
        setProducts((prev) => [...prev, ...newMappedProducts]);
        setPagination(response.pagination);

        console.log(
          `✅ Loaded page ${nextPage}, total products: ${
            products.length + newMappedProducts.length
          }`
        );
      } catch (err) {
        const errorMessage = apiErrorUtils.getErrorMessage(err);
        setError(errorMessage);
        console.error("❌ Failed to load more products:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [pagination, loading, initialParams, products.length]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch,
    loadMore,
    hasMore: pagination.currentPage < pagination.totalPages,
  };
};

// Hook for fetching a single real product
export const useRealProduct = (productId: string | null) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productsApi.getProduct(id);

      // Map API response to internal type
      const mappedProduct = mapApiProductToProduct(response.data);

      setProduct(mappedProduct);
    } catch (err) {
      const errorMessage = apiErrorUtils.getErrorMessage(err);
      setError(errorMessage);
      console.error("Failed to fetch real product:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    } else {
      setProduct(null);
      setError(null);
    }
  }, [productId, fetchProduct]);

  const refetch = useCallback(() => {
    if (productId) {
      return fetchProduct(productId);
    }
  }, [productId, fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch,
  };
};

// Hook for featured products (first few products)
export const useFeaturedProducts = (count: number = 8) => {
  return useRealProductsList({ page: 1, perPage: count });
};

// Hook for products by category
export const useRealProductsByCategory = (categoryId: string | null, params: Omit<ProductsListParams, 'category'> = {}) => {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchProducts = useCallback(async (id: string, fetchParams: Omit<ProductsListParams, 'category'> = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await productsApi.getProductsByCategory(id, fetchParams);
      
      // Map API response to internal types
      const mappedProducts = mapApiProductsToProductSummaries(response.data);
      
      setProducts(mappedProducts);
      setPagination(response.pagination);
      console.log("✅ Loaded", mappedProducts.length, "products for category", id);
    } catch (err) {
      const errorMessage = apiErrorUtils.getErrorMessage(err);
      setError(errorMessage);
      console.error("❌ Failed to fetch category products:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchProducts(categoryId, params);
    } else {
      setProducts([]);
      setError(null);
    }
  }, [categoryId, fetchProducts, params]);

  const refetch = useCallback(() => {
    if (categoryId) {
      return fetchProducts(categoryId, params);
    }
  }, [categoryId, fetchProducts, params]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch,
  };
};
