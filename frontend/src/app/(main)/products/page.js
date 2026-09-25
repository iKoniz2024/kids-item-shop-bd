import { Suspense } from "react";
import Products from "@/views/Products/Products";
import { getApiUrl } from "@/utils/getApiUrl";

export const metadata = {
  title: "All Products",
};

export const dynamic = 'force-dynamic';

async function fetchProductsData(searchParams = {}) {
  const baseUrl = getApiUrl();
  const params = new URLSearchParams();
  if (searchParams?.category) params.set("category", searchParams.category);
  if (searchParams?.page) params.set("page", searchParams.page);
  if (searchParams?.limit) params.set("limit", searchParams.limit || "12");
  if (searchParams?.sort) params.set("sort", searchParams.sort || "newest");
  if (searchParams?.search) params.set("search", searchParams.search);

  const queryString = params.toString() || "page=1&limit=12&sort=newest";
  const productsUrl = `${baseUrl}/products?${queryString}`;

  try {
    const [categoriesRes, productsRes] = await Promise.all([
      fetch(`${baseUrl}/categories`, { next: { revalidate: 120 }, signal: AbortSignal.timeout(6000) }),
      fetch(productsUrl, { next: { revalidate: 120 }, signal: AbortSignal.timeout(6000) }),
    ]);

    return {
      categoriesData: categoriesRes.ok ? await categoriesRes.json() : [],
      productsData: productsRes.ok ? await productsRes.json() : { products: [], totalPages: 1, totalProducts: 0 },
    };
  } catch (err) {
    console.error("Failed to fetch products page data:", err.message);
    return {
      categoriesData: [],
      productsData: { products: [], totalPages: 1, totalProducts: 0 },
    };
  }
}

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialData = await fetchProductsData(resolvedSearchParams);

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Products...</div>}>
      <Products initialCategories={initialData.categoriesData} initialProducts={initialData.productsData} />
    </Suspense>
  );
}
