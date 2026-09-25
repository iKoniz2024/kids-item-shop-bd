const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { withCache, clearCache } = require("../utils/cache");
const { buildIdQuery } = require("../utils/buildIdQuery");
const { processImageUpload } = require("../utils/uploadHelper");
const { getCategoriesWithCountsInternal } = require("./categories.controller");
const { getAllBannersInternal } = require("./banner.controller");

const createProduct = async (req, res) => {
    try {
        const db = getDB();
        const productsCollection = db.collection("products");

        const {
            title,
            description,
            category,
            primaryCategory,
            categories,
            collectionIds,
            price,
            discountPercentage,
            stock,
            tags,
            brand,
            weight,
            dimensions,
            warrantyInformation,
            shippingInformation,
            returnPolicy,
            minimumOrderQuantity,
            sizes,
            sizeMeasurements,
            colors,
            attributes,
            variants,
            images,
            thumbnail
        } = req.body;

        const normalizedPrice = Number(price ?? 0);
        const normalizedDiscountPercentage = Number(discountPercentage ?? 0);
        const normalizedStock = Number(stock ?? 0);
        const normalizedMinimumOrderQuantity = Number(minimumOrderQuantity ?? 1);

        const resolvedPrimaryCategory = primaryCategory || category || "";
        const resolvedCategories = Array.isArray(categories) && categories.length > 0
            ? categories
            : (resolvedPrimaryCategory ? [resolvedPrimaryCategory] : []);

        const newProduct = {
            title,
            description,
            category: resolvedPrimaryCategory,
            primaryCategory: resolvedPrimaryCategory,
            categories: resolvedCategories,
            collectionIds: Array.isArray(collectionIds) ? collectionIds : [],
            price: normalizedPrice,
            discountPercentage: normalizedDiscountPercentage,
            rating: 0,
            stock: normalizedStock,
            tags: tags || [],
            brand: brand || "",
            sku: `SKU-${Date.now()}`,
            weight: Number(weight ?? 0),

            dimensions: {
                width: dimensions?.width || null,
                height: dimensions?.height || null,
                depth: dimensions?.depth || null
            },

            warrantyInformation,
            shippingInformation,

            availabilityStatus: normalizedStock > 0
                ? "In Stock"
                : "Out of Stock",

            reviews: [],

            returnPolicy,
            minimumOrderQuantity: normalizedMinimumOrderQuantity,
            sizes: sizes || [],
            sizeMeasurements: sizeMeasurements || [],
            colors: Array.isArray(colors)
                ? await Promise.all(colors.map(async (c) => ({ ...c, image: await processImageUpload(c.image) })))
                : [],
            attributes: attributes || {},
            variants: Array.isArray(variants) ? variants : [],

            meta: {
                createdAt: new Date(),
                updatedAt: new Date(),
                barcode: "",
                qrCode: ""
            },

            vendorId: req.user ? req.user.id : null,
            images: Array.isArray(images)
                ? await Promise.all(images.map((img) => processImageUpload(img)))
                : [],
            thumbnail: await processImageUpload(thumbnail || "")
        };

        const result = await productsCollection.insertOne(newProduct);
        clearCache();

        res.status(201).send({
            message: "Product created successfully",
            insertedId: result.insertedId
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const getBestSellingIds = async (db) => {
    return await withCache("bestSellingIdsSet", 3600, async () => {
        try {
            const ordersCollection = db.collection("orders");
            const topOrders = await ordersCollection
                .aggregate([
                    { $sort: { _id: -1 } },
                    { $limit: 300 },
                    { $unwind: "$items" },
                    { $group: { _id: "$items.productId", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 20 }
                ])
                .toArray();
            return topOrders.map(item => (item._id ? item._id.toString() : "")).filter(Boolean);
        } catch (e) {
            console.error("Error in getBestSellingIds:", e.message);
            return [];
        }
    });
};

const getBestSellingProductsInternal = async (db) => {
    const productsCollection = db.collection("products");
    let products = [];
    try {
        const topIds = await getBestSellingIds(db);
        if (topIds.length > 0) {
            const validObjectIds = [];
            topIds.forEach(id => {
                if (ObjectId.isValid(id)) {
                    validObjectIds.push(new ObjectId(id));
                }
            });

            if (validObjectIds.length > 0) {
                products = await productsCollection
                    .find({ _id: { $in: validObjectIds } })
                    .project({
                        description: 0,
                        dimensions: 0,
                        reviews: 0,
                        images: 0,
                        warrantyInformation: 0,
                        shippingInformation: 0,
                        returnPolicy: 0,
                        meta: 0,
                        tags: 0,
                        sku: 0,
                        weight: 0,
                        availabilityStatus: 0,
                        minimumOrderQuantity: 0
                    })
                    .toArray();
            }
        }
    } catch (e) {
        console.error("Best-selling lookup failed:", e.message);
    }

    if (!products || products.length === 0) {
        products = await productsCollection
            .find({})
            .project({
                description: 0,
                dimensions: 0,
                reviews: 0,
                images: 0,
                warrantyInformation: 0,
                shippingInformation: 0,
                returnPolicy: 0,
                meta: 0,
                tags: 0,
                sku: 0,
                weight: 0,
                availabilityStatus: 0,
                minimumOrderQuantity: 0
            })
            .sort({ rating: -1, _id: -1 })
            .limit(12)
            .toArray();
    }

    return products.map(product => ({
        ...product,
        badge: "best-seller"
    }));
};

const getAllProducts = async (req, res) => {

    try {
        const db = getDB();
        const productsCollection = db.collection("products");

        const page = req.query.page ? parseInt(req.query.page) : null;
        const limit = req.query.limit ? parseInt(req.query.limit) : null;

        const search = req.query.search || "";
        const category = req.query.category || "";
        const collection = req.query.collection || "";
        const brand = req.query.brand || "";
        const sort = req.query.sort || "";

        const andConditions = [];
        const escapeRegex = (str) => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

        if (search && search.trim()) {
            const cleanSearch = search.trim();
            const cleanRegex = { $regex: escapeRegex(cleanSearch), $options: "i" };
            andConditions.push({
                $or: [
                    { $text: { $search: cleanSearch } },
                    { title: cleanRegex },
                    { category: cleanRegex },
                    { primaryCategory: cleanRegex },
                    { categories: cleanRegex },
                    { brand: cleanRegex },
                    { tags: cleanRegex },
                    { sku: cleanRegex }
                ]
            });
        }

        if (category && category.trim()) {
            const categoriesArray = category.split(",").map(c => c.trim()).filter(Boolean);
            if (categoriesArray.length > 0) {
                const categoryMatches = categoriesArray.flatMap(c => {
                    const clean = escapeRegex(c);
                    return [
                        c,
                        c.toLowerCase(),
                        c.toUpperCase(),
                        c.charAt(0).toUpperCase() + c.slice(1),
                        new RegExp(`^${clean}$`, "i")
                    ];
                });

                andConditions.push({
                    $or: [
                        { category: { $in: categoryMatches } },
                        { primaryCategory: { $in: categoryMatches } },
                        { categories: { $in: categoryMatches } }
                    ]
                });
            }
        }

        if (collection && collection.trim()) {
            const collectionsArray = collection.split(",").map(c => c.trim()).filter(Boolean);
            if (collectionsArray.length > 0) {
                const collectionMatches = collectionsArray.flatMap(c => [
                    c,
                    c.toLowerCase(),
                    new RegExp(`^${escapeRegex(c)}$`, "i")
                ]);
                andConditions.push({
                    collectionIds: { $in: collectionMatches }
                });
            }
        }

        if (brand && brand.trim()) {
            const cleanBrand = brand.trim();
            const brandMatches = [
                cleanBrand,
                cleanBrand.toLowerCase(),
                new RegExp(`^${escapeRegex(cleanBrand)}$`, "i")
            ];
            andConditions.push({ brand: { $in: brandMatches } });
        }

        if (req.user && req.user.role === "vendor") {
            andConditions.push({ vendorId: req.user.id.toString() });
        } else if (req.query.vendorId && req.query.vendorId.trim()) {
            andConditions.push({ vendorId: req.query.vendorId.trim() });
        }

        const query = andConditions.length > 0 ? { $and: andConditions } : {};

        let sortOption = { _id: -1 };

        if (sort === "asc") {
            sortOption = { price: 1 };
        } else if (sort === "desc") {
            sortOption = { price: -1 };
        }

        const cacheKey = `products_${page}_${limit}_${search}_${category}_${brand}_${collection}_${sort}`;
        const result = await withCache(cacheKey, 300, async () => {
            const bestSellingIds = await getBestSellingIds(db);
            const bestSellingIdsSet = new Set(bestSellingIds);

            const formatProducts = (prods) => prods.map(p => ({
                ...p,
                badge: p.badge || (bestSellingIdsSet.has(p._id ? p._id.toString() : "") ? "best-seller" : null)
            }));

            if (page && limit) {
                const skip = (page - 1) * limit;
                const totalProducts = Object.keys(query).length === 0 
                    ? await productsCollection.estimatedDocumentCount()
                    : await productsCollection.countDocuments(query);

                const products = await productsCollection
                    .find(query)
                    .project({ 
                        description: 0, 
                        dimensions: 0, 
                        reviews: 0, 
                        images: 0, 
                        warrantyInformation: 0, 
                        shippingInformation: 0, 
                        returnPolicy: 0, 
                        tags: 0,
                        sku: 0,
                        weight: 0,
                        availabilityStatus: 0,
                        minimumOrderQuantity: 0
                    })
                    .sort(sortOption)
                    .skip(skip)
                    .limit(limit)
                    .toArray();

                return {
                    totalProducts,
                    currentPage: page,
                    totalPages: Math.ceil(totalProducts / limit),
                    products: formatProducts(products),
                };
            } else {
                const products = await productsCollection
                    .find(query)
                    .project({ 
                        description: 0, 
                        dimensions: 0, 
                        reviews: 0, 
                        images: 0, 
                        warrantyInformation: 0, 
                        shippingInformation: 0, 
                        returnPolicy: 0, 
                        tags: 0,
                        sku: 0,
                        weight: 0,
                        availabilityStatus: 0,
                        minimumOrderQuantity: 0
                    })
                    .sort(sortOption)
                    .toArray();

                return {
                    totalProducts: products.length,
                    products: formatProducts(products),
                };
            }
        });

        res.send(result);

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getSingleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const productsCollection = db.collection("products");

        const cacheKey = `product_${id}`;
        const result = await withCache(cacheKey, 600, async () => {
            return await productsCollection.findOne(buildIdQuery(id));
        });

        if (!result) {
            return res.status(404).send({ message: "Product not found" });
        }

        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const productsCollection = db.collection("products");

        const existingProduct = await productsCollection.findOne(buildIdQuery(id));
        if (!existingProduct) {
            return res.status(404).send({ message: "Product not found" });
        }

        // Strict ownership enforcement for ALL users (including Admin)
        if (req.user) {
            const currentUserId = req.user.id.toString();
            const productVendorId = existingProduct.vendorId ? existingProduct.vendorId.toString() : null;
            if (!productVendorId || productVendorId !== currentUserId) {
                return res.status(403).send({ message: "Forbidden. You can only modify your own products." });
            }
        }

        const primaryCategory = req.body.primaryCategory || req.body.category || existingProduct.primaryCategory || existingProduct.category || "";
        const categories = req.body.categories && Array.isArray(req.body.categories) && req.body.categories.length > 0
            ? req.body.categories
            : (existingProduct.categories || (primaryCategory ? [primaryCategory] : []));

        const updatedFields = {
            ...req.body,
            category: primaryCategory,
            primaryCategory,
            categories,
            ...(req.body.collectionIds !== undefined && { collectionIds: Array.isArray(req.body.collectionIds) ? req.body.collectionIds : [] }),
            ...(req.body.attributes !== undefined && { attributes: req.body.attributes }),
            ...(req.body.variants !== undefined && { variants: Array.isArray(req.body.variants) ? req.body.variants : [] }),
            ...(req.body.price !== undefined && { price: Number(req.body.price) }),
            ...(req.body.discountPercentage !== undefined && { discountPercentage: Number(req.body.discountPercentage) }),
            ...(req.body.stock !== undefined && { stock: Number(req.body.stock) }),
            ...(req.body.weight !== undefined && { weight: Number(req.body.weight) }),
            ...(req.body.minimumOrderQuantity !== undefined && { minimumOrderQuantity: Number(req.body.minimumOrderQuantity) }),
            "meta.updatedAt": new Date()
        };

        await productsCollection.updateOne(
            buildIdQuery(id),
            { $set: updatedFields }
        );

        clearCache();
        res.send({ message: "Product updated successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const productsCollection = db.collection("products");

        const existingProduct = await productsCollection.findOne(buildIdQuery(id));
        if (!existingProduct) {
            return res.status(404).send({ message: "Product not found" });
        }

        // Strict ownership enforcement for ALL users (including Admin)
        if (req.user) {
            const currentUserId = req.user.id.toString();
            const productVendorId = existingProduct.vendorId ? existingProduct.vendorId.toString() : null;
            if (!productVendorId || productVendorId !== currentUserId) {
                return res.status(403).send({ message: "Forbidden. You can only delete your own products." });
            }
        }

        await productsCollection.deleteOne(buildIdQuery(id));

        clearCache();
        res.send({ message: "Product deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getFlashSaleProducts = async (req, res) => {
    try {
        const { products, maxStock } = await withCache("flashSaleProducts", 600, async () => {
            const db = getDB();
            const productsCollection = db.collection("products");

            const products = await productsCollection
                .aggregate([
                    {
                        $match: {
                            discountPercentage: { $gte: 50 },
                            stock: { $gt: 0 }
                        }
                    },
                    {
                        $project: {
                            description: 0,
                            dimensions: 0,
                            reviews: 0,
                            images: 0,
                            warrantyInformation: 0,
                            shippingInformation: 0,
                            returnPolicy: 0,
                            meta: 0,
                            tags: 0,
                            sku: 0,
                            weight: 0,
                            availabilityStatus: 0,
                            minimumOrderQuantity: 0
                        }
                    },
                    {
                        $sort: {
                            discountPercentage: -1
                        }
                    },
                    {
                        $limit: 8
                    }
                ])
                .toArray();

            const maxStock = 50;
            return { products, maxStock };
        });

        res.send({ products, maxStock });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getBestSellingProducts = async (req, res) => {
    try {
        const result = await withCache("bestSellingProducts", 600, async () => {
            const db = getDB();
            return await getBestSellingProductsInternal(db);
        });

        res.send({ products: result });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getNewArrivals = async (req, res) => {
    try {
        const products = await withCache("newArrivals", 600, async () => {
            const db = getDB();
            const productsCollection = db.collection("products");

            return await productsCollection
                .find({})
                .project({
                    description: 0,
                    dimensions: 0,
                    reviews: 0,
                    images: 0,
                    warrantyInformation: 0,
                    shippingInformation: 0,
                    returnPolicy: 0,
                    meta: 0,
                    tags: 0,
                    sku: 0,
                    weight: 0,
                    availabilityStatus: 0,
                    minimumOrderQuantity: 0
                })
                .sort({
                    _id: -1
                })
                .limit(12)
                .toArray();
        });

        res.send({ products });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getLatestReviews = async (req, res) => {
    try {
        const reviews = await withCache("latestReviews", 15, async () => {
            const db = getDB();
            const productsCollection = db.collection("products");

            // We only look at products that have reviews to reduce the pipeline size
            return await productsCollection.aggregate([
                { $match: { "reviews.0": { $exists: true } } },
                { $unwind: "$reviews" },
                { $replaceRoot: { newRoot: { $mergeObjects: ["$reviews", { productName: "$title" }] } } },
                { $sort: { date: -1 } },
                { $limit: 10 }
            ]).toArray();
        });

        res.send({ reviews });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getFeaturedProducts = async (req, res) => {
    try {
        const products = await withCache("featuredProducts", 15, async () => {
            const db = getDB();
            const productsCollection = db.collection("products");

            return await productsCollection
                .find({})
                .project({
                    description: 0,
                    dimensions: 0,
                    reviews: 0,
                    images: 0,
                    warrantyInformation: 0,
                    shippingInformation: 0,
                    returnPolicy: 0,
                    meta: 0,
                    tags: 0,
                    sku: 0,
                    weight: 0,
                    availabilityStatus: 0,
                    minimumOrderQuantity: 0
                })
                .sort({ rating: -1 })
                .limit(20)
                .toArray();
        });

        res.send({ products });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getHomeData = async (req, res) => {
    try {
        const db = getDB();
        const data = await withCache("consolidatedHomeData", 300, async () => {
            const productsCollection = db.collection("products");

            const fetchNewArrivals = async () => {
                return await productsCollection
                    .find({})
                    .project({
                        description: 0,
                        dimensions: 0,
                        reviews: 0,
                        images: 0,
                        warrantyInformation: 0,
                        shippingInformation: 0,
                        returnPolicy: 0,
                        meta: 0,
                        tags: 0,
                        sku: 0,
                        weight: 0,
                        availabilityStatus: 0,
                        minimumOrderQuantity: 0
                    })
                    .sort({ _id: -1 })
                    .limit(12)
                    .toArray();
            };

            const fetchFlashSale = async () => {
                const prods = await productsCollection
                    .aggregate([
                        {
                            $match: {
                                discountPercentage: { $gte: 50 },
                                stock: { $gt: 0 }
                            }
                        },
                        {
                            $project: {
                                description: 0,
                                dimensions: 0,
                                reviews: 0,
                                images: 0,
                                warrantyInformation: 0,
                                shippingInformation: 0,
                                returnPolicy: 0,
                                meta: 0,
                                tags: 0,
                                sku: 0,
                                weight: 0,
                                availabilityStatus: 0,
                                minimumOrderQuantity: 0
                            }
                        },
                        { $sort: { discountPercentage: -1 } },
                        { $limit: 8 }
                    ])
                    .toArray();
                return { products: prods, maxStock: 50 };
            };

            const [categoriesData, newArrivals, bestSellers, flashSaleData, bannersData] = await Promise.all([
                getCategoriesWithCountsInternal(db).catch(() => []),
                fetchNewArrivals().catch(() => []),
                getBestSellingProductsInternal(db).catch(() => []),
                fetchFlashSale().catch(() => ({ products: [], maxStock: 50 })),
                getAllBannersInternal(db).catch(() => [])
            ]);

            return {
                categoriesData,
                newArrivalsData: { products: newArrivals },
                bestSellingData: { products: bestSellers },
                flashSaleData,
                bannersData
            };
        });

        res.send(data);
    } catch (error) {
        console.error("Error fetching home data:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    getFlashSaleProducts,
    getBestSellingProducts,
    getNewArrivals,
    getLatestReviews,
    getFeaturedProducts,
    getHomeData
};