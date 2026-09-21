/**
 * Utility to compute uniform stock progress percentage, text label, and styling.
 */
export function calculateStockProgress(product) {
  const stock = typeof product?.stock === 'number' ? Math.max(0, product.stock) : 0;

  if (stock <= 0) {
    return {
      stock: 0,
      percentage: 0,
      label: "0 left",
      isLow: true,
    };
  }

  // Determine a realistic baseline stock capacity:
  // 1. Use product's own initialStock or maxStock if valid and >= stock
  // 2. Otherwise default to standard baseline of 50 (or current stock if higher)
  let baseline = 50;
  if (product?.initialStock && product.initialStock >= stock) {
    baseline = product.initialStock;
  } else if (product?.maxStock && product.maxStock >= stock) {
    baseline = product.maxStock;
  } else {
    baseline = Math.max(stock, 50);
  }

  let percentage = Math.round((stock / baseline) * 100);
  // Clamp between 5% and 100% so any positive stock shows a visible progress indicator
  percentage = Math.min(Math.max(percentage, 5), 100);

  const isLow = stock <= 5 || percentage <= 25;
  const label = stock <= 5 ? `${stock} left` : `${stock} in stock`;

  return {
    stock,
    percentage,
    label,
    isLow,
  };
}
