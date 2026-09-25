"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from "react";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/utils/currency";
import OrderModal from "@/components/ui/OrderModal";
import { useAuth } from "@/hooks/useAuth";
import { useAddToCart } from "@/hooks/useAddToCart";
import useSettings from "@/hooks/useSettings";
import { calculateStockProgress } from "@/utils/stockProgress";
import ImageZoom from "@/components/ui/ImageZoom";

export default function FlashSaleProductCard({ product, index }) {
  const router = useRouter();
  const { addToCart } = useAddToCart();
  const { siteName } = useSettings();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("checkout");
  const { user } = useAuth();
  const isAdminOrVendor = user?.role === "admin" || user?.role === "vendor";
  const hasDiscount = product.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    : null;

  const isOutOfStock = product.stock === 0;
  const stockProgress = calculateStockProgress(product);
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
        viewport={{ once: true, margin: "-40px" }}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          }),
        }}
        className="w-full max-w-[270px] h-full mx-auto"
      >
        <div className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
          <Link href={`/product/${product._id}`} className="relative aspect-square w-full overflow-hidden bg-muted/40 block shrink-0 p-2">
            <ImageZoom
              src={product.thumbnail || product.images?.[0] || undefined}
              alt={product.title}
              zoomScale={1.35}
              containerClassName="h-full w-full"
              className="h-full w-full object-contain"
            />

            {hasDiscount && (
              <div className="absolute left-2 top-2 z-10 rounded-full badge-gold px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black tracking-tight shadow-sm">
                -{Math.round(product.discountPercentage)}%
              </div>
            )}

            {product.stock <= 5 && product.stock > 0 && (
              <div className="absolute right-2 top-2 z-10">
                <Badge variant="secondary" className="text-[8px] sm:text-[9px] font-semibold px-1.5 sm:px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200">
                  Only {product.stock} left
                </Badge>
              </div>
            )}

            {product.stock === 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-xs">
                <Badge variant="destructive" className="text-[9px] font-semibold px-2 py-0.5">
                  Out of Stock
                </Badge>
              </div>
            )}
          </Link>

          <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3 bg-card shrink-0 gap-1.5 sm:gap-2">
            <div className="space-y-1">
              {/* Shop Name */}
              <div className="mb-0.5">
                <span className="text-[8.5px] sm:text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {product.shopName || product.shop?.name || siteName}
                </span>
              </div>
              
              <Link href={`/product/${product._id}`} className="block">
                <h3 className="line-clamp-2 text-xs font-bold text-foreground group-hover:text-primary dark:group-hover:text-accent transition-colors leading-snug min-h-[2rem] sm:min-h-[2.25rem]">
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
              
              {/* Stock Progress Bar */}
              <div className="mt-1 space-y-0.5">
                <div className="flex items-center justify-between text-[8.5px] sm:text-[10px] text-muted-foreground font-medium">
                  <span>{stockProgress.label}</span>
                  <span>{stockProgress.percentage}%</span>
                </div>
                <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500" 
                    style={{ width: `${stockProgress.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-0.5">
              <button
                disabled={isOutOfStock || isAdminOrVendor}
                onClick={handleDirectOrderNow}
                title={isAdminOrVendor ? "Admins cannot purchase" : "Order Now"}
                className={`w-full flex items-center justify-center gap-1 rounded-full btn-action-gold py-1.5 px-2 text-[9.5px] sm:text-xs font-extrabold transition-all duration-200 active:scale-[0.98] ${isOutOfStock || isAdminOrVendor ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} shadow-xs`}
              >
                <Zap className="size-3.5 fill-current shrink-0" />
                <span>{isOutOfStock ? "Unavailable" : "Order Now"}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {showModal && !isAdminOrVendor && (
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
