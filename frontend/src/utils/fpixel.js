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
      const hasValidValue = !isNaN(rawVal) && rawVal > 0;

      if (hasValidValue) {
        cleanOptions.value = Number(rawVal.toFixed(2));
        cleanOptions.currency = (options.currency || "BDT").toString().toUpperCase().trim();
      } else if (["Purchase", "AddToCart", "InitiateCheckout", "ViewContent"].includes(name)) {
        cleanOptions.value = 1;
        cleanOptions.currency = (options.currency || "BDT").toString().toUpperCase().trim();
      }

      if (options.content_name) {
        cleanOptions.content_name = String(options.content_name);
      }

      if (options.content_type) {
        cleanOptions.content_type = String(options.content_type);
      }

      if (Array.isArray(options.content_ids)) {
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
