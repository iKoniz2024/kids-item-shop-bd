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

      if (options.value !== undefined || options.currency !== undefined) {
        const rawVal = Number(options.value);
        cleanOptions.value = isNaN(rawVal) ? 0 : Number(rawVal.toFixed(2));
        cleanOptions.currency = String(options.currency || "BDT").toUpperCase().trim();
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
        if (!(key in cleanOptions)) {
          cleanOptions[key] = options[key];
        }
      });

      window.fbq("track", name, cleanOptions);
    } catch {
      // Safe fallback
    }
  }
};
