"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from "react";

import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { formatBDT } from "@/utils/currency";
import OrderModal from "@/components/ui/OrderModal";
import { useAuth } from "@/hooks/useAuth";
import { useAddToCart } from "@/hooks/useAddToCart";

export default function NewArrivalsProductCard({ product, index }) {
  const router = useRouter();
  const { addToCart } = useAddToCart();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("checkout");
  const { user } = useAuth();
  const isAdminOrVendor = user?.role === "admin" || user?.role === "vendor";
  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    : null;
  const isOutOfStock = product.stock === 0;
  const sizeMeasurementSizes = Array.isArray(product.sizeMeasurements)
    ? product.sizeMeasurements.map(sm => typeof sm === 'string' ? sm : sm?.size).filter(Boolean)
    : [];
  const hasOptions =
    (Array.isArray(product.sizes) && product.sizes.length > 0) ||
    sizeMeasurementSizes.length > 0 ||
    (Array.isArray(product.colors) && product.colors.length > 0) ||
    (Array.isArray(product.variants) && product.variants.length > 0) ||
    (product.attributes && typeof product.attributes === "object" && Object.entries(product.attributes).some(([k, v]) => Array.isArray(v) && v.length > 0));

  const handleDirectAddToCart = (e) => {
    e.preventDefault();
    setModalMode("cart");
    setShowModal(true);
  };

  const handleDirectOrderNow = (e) => {
    e.preventDefault();
    setModalMode("checkout");
    setShowModal(true);
  };

  return (
    <>
      <motion.div
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0 },
          visible: (i) => ({
            opacity: 1,
            transition: { delay: i * 0.05, duration: 0.3 },
          }),
        }}
        className="shrink-0 w-[240px] sm:w-[265px]"
      >
        <div className="group flex flex-col h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xs transition-all duration-300 hover:shadow-md">
          <Link href={`/product/${product._id}`} className="relative h-[165px] sm:h-[180px] w-full overflow-hidden bg-muted/40 block shrink-0 p-2 flex items-center justify-center">
            <img
              src={product.thumbnail || product.images?.[0] || null}
              alt={product.title}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {hasDiscount && (
              <div className="absolute left-2 top-2 z-10 rounded-full badge-gold px-2 py-0.5 text-[10px] font-black tracking-tight shadow-sm">
                -{Math.round(product.discountPercentage)}%
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-xs">
                <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[9px] font-semibold text-white">
                  Out of Stock
                </span>
              </div>
            )}
          </Link>

          <div className="flex flex-1 flex-col justify-between p-3 bg-card gap-2.5">
            <div className="space-y-1">
              <Link href={`/product/${product._id}`} className="block">
                <h3 className="line-clamp-1 text-xs sm:text-sm font-bold text-foreground group-hover:text-primary dark:group-hover:text-accent transition-colors">
                  {product.title}
                </h3>
              </Link>

              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-extrabold text-primary dark:text-accent">
                  {formatBDT(hasDiscount ? discountedPrice : product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground line-through font-normal">
                    {formatBDT(product.price)}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-0.5">
              <button
                disabled={isOutOfStock || isAdminOrVendor}
                onClick={handleDirectAddToCart}
                title={isAdminOrVendor ? "Admins cannot purchase" : "Add to Cart"}
                className={`w-full flex items-center justify-center gap-1.5 rounded-full border border-border bg-secondary hover:bg-secondary/80 text-secondary-foreground py-1.5 px-3 text-[10px] sm:text-xs font-extrabold transition-all ${isOutOfStock || isAdminOrVendor ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} shadow-2xs`}
              >
                <ShoppingCart className="size-3.5 shrink-0 text-secondary-foreground" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {!isAdminOrVendor && (
        <OrderModal
          product={product}
          open={showModal}
          onClose={() => setShowModal(false)}
          mode={modalMode}
        />
      )}
    </>
  );
}
