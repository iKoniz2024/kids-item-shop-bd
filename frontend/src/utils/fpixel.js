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
      const val = !isNaN(rawVal) && rawVal > 0 ? Number(rawVal.toFixed(2)) : 1;
      const curr = String(options.currency || "BDT").toUpperCase().trim();

      if (["Purchase", "AddToCart", "InitiateCheckout", "ViewContent"].includes(name) || options.value !== undefined) {
        cleanOptions.value = val;
        cleanOptions.currency = curr.length === 3 ? curr : "BDT";
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
