const setupIndexes = async (db) => {
    try {
        console.log("Setting up MongoDB indexes...");

        const productsCollection = db.collection("products");
        const ordersCollection = db.collection("orders");
        const categoriesCollection = db.collection("categories");
        const usersCollection = db.collection("users");

        // Categories indexes
        await categoriesCollection.createIndex({ slug: 1 }, { unique: true, sparse: true });
        await categoriesCollection.createIndex({ parentId: 1 });
        await categoriesCollection.createIndex({ status: 1, sortOrder: 1 });

        // Users indexes
        await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: true });

        // Products collection indexes
        await productsCollection.createIndex({ category: 1, _id: -1 });
        await productsCollection.createIndex({ primaryCategory: 1, _id: -1 });
        await productsCollection.createIndex({ categories: 1, _id: -1 });
        await productsCollection.createIndex({ brand: 1 });
        await productsCollection.createIndex({ vendorId: 1 });
        await productsCollection.createIndex({ status: 1 });
        await productsCollection.createIndex({ price: 1 });
        await productsCollection.createIndex({ price: -1 });
        await productsCollection.createIndex({ discountPercentage: -1 });
        await productsCollection.createIndex({ rating: -1 });
        await productsCollection.createIndex({ title: 1 });
        await productsCollection.createIndex({ tags: 1 });
        await productsCollection.createIndex({ title: "text", category: "text", brand: "text", tags: "text" }, { name: "product_text_search_idx", background: true }).catch(() => {});

        const cartsCollection = db.collection("carts");
        const collectionsCollection = db.collection("collections");
        const bannersCollection = db.collection("banners");
        const attributesCollection = db.collection("attributes");

        // Carts indexes
        await cartsCollection.createIndex({ userId: 1 });

        // Collections indexes
        await collectionsCollection.createIndex({ slug: 1 }, { unique: true, sparse: true });
        await collectionsCollection.createIndex({ status: 1, sortOrder: 1 });

        // Banners indexes
        await bannersCollection.createIndex({ createdAt: -1 });

        // Attributes indexes
        await attributesCollection.createIndex({ code: 1 }, { unique: true, sparse: true });

        // Orders collection indexes
        await ordersCollection.createIndex({ userId: 1, createdAt: -1 });
        await ordersCollection.createIndex({ "items.productId": 1 });
        await ordersCollection.createIndex({ createdAt: -1 });
        await ordersCollection.createIndex({ orderStatus: 1, createdAt: -1 });
        await ordersCollection.createIndex({ "shippingAddress.phone": 1 });

        console.log("MongoDB indexes setup successfully.");
    } catch (error) {
        console.error("Error setting up MongoDB indexes:", error.message);
    }
};

module.exports = { setupIndexes };
