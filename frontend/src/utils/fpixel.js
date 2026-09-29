export const pageview = () => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    try {
      window.fbq("track", "PageView");
    } catch {
      // Safe fallback
    }
  }
};

export const event = (name, options = {}) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    try {
      const cleanOptions = {};

      const rawVal = Number(options.value);
      const val = !isNaN(rawVal) && rawVal >= 0 ? Number(rawVal.toFixed(2)) : 0;
      
      // Meta Browser Pixel SDK (fbevents.js) unsupported currencies like BDT trigger invalid currency errors.
      // We map unsupported browser currencies to 'USD' for client-side fbq while CAPI handles BDT on backend.
      const fbSupportedCurrencies = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "AED", "SAR"];
      const rawCurr = String(options.currency || "USD").replace(/[^a-zA-Z]/g, "").toUpperCase();
      const curr = fbSupportedCurrencies.includes(rawCurr) ? rawCurr : "USD";

      if (["Purchase", "AddToCart", "InitiateCheckout", "ViewContent"].includes(name) || options.value !== undefined) {
        cleanOptions.value = val;
        cleanOptions.currency = curr;
      }

      if (options.content_name) {
        cleanOptions.content_name = String(options.content_name);
      }

      if (options.content_type) {
        cleanOptions.content_type = String(options.content_type);
      }

      if (Array.isArray(options.content_ids) && options.content_ids.length > 0) {
        cleanOptions.content_ids = options.content_ids.map((id) => String(id));
      }

      if (options.num_items !== undefined) {
        cleanOptions.num_items = Number(options.num_items) || 1;
      }

      Object.keys(options).forEach((key) => {
        if (!(key in cleanOptions) && key !== "currency" && key !== "value") {
          cleanOptions[key] = options[key];
        }
      });

      window.fbq("track", name, cleanOptions);
    } catch {
      // Safe fallback
    }
  }
};
