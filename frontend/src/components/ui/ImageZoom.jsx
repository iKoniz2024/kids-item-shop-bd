"use client";

import { useState, useRef } from "react";

export default function ImageZoom({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  zoomScale = 2.2,
  children,
  ...props
}) {
  const [transformOrigin, setTransformOrigin] = useState("center center");
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setTransformOrigin(`${x}% ${y}%`);
  };

  const handleMouseEnter = (e) => {
    handleMouseMove(e);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformOrigin("center center");
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden cursor-crosshair ${containerClassName}`}
    >
      <img
        src={src}
        alt={alt}
        style={{
          transformOrigin: transformOrigin,
          transform: isHovered ? `scale(${zoomScale})` : "scale(1)",
          transition: isHovered
            ? "transform 0.15s ease-out, transform-origin 0.05s ease-out"
            : "transform 0.35s ease-out, transform-origin 0.35s ease-out",
        }}
        className={`pointer-events-none w-full h-full object-contain ${className}`}
        {...props}
      />
      {children}
    </div>
  );
}
