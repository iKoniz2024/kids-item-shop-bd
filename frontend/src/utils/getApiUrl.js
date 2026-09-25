// export function getApiUrl() {
//   let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
//   url = url.trim().replace(/\/+$/, "");
//   if (!url.endsWith("/api")) {
//     url += "/api";
//   }
//   return url;
// }


export function getApiUrl() {
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://localhost:5000/api";
  }

  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:5000/api";
  }

  let url = process.env.NEXT_PUBLIC_API_URL || "https://kids-item-shop-backend.vercel.app/api";

  url = url.trim().replace(/\/+$/, "");

  if (!url.endsWith("/api")) {
    url += "/api";
  }

  return url;
}