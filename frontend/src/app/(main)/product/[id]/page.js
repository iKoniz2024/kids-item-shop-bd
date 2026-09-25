import { cache } from "react";
import ProductDetails from "@/views/Products/ProductDetails";
import { getApiUrl } from "@/utils/getApiUrl";

const getProductData = cache(async (id) => {
  if (!id) return null;
  try {
    const baseUrl = getApiUrl();
    const res = await fetch(`${baseUrl}/products/${id}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(2500),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {}
  return null;
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductData(id);
  if (product) {
    return {
      title: `${product.title} | Kids Item Shop`,
      description: product.description || product.title,
    };
  }
  return { title: "Product Details" };
}

export default async function Page({ params }) {
  const { id } = await params;
  const initialProduct = await getProductData(id);

  return <ProductDetails initialProduct={initialProduct} />;
}
