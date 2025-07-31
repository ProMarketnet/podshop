import { Express, Response } from "express";
import { db } from "./server/storage.js";
import { AuthenticatedRequest } from "./Complete database operations interfacereplitAuth.js";
import { 
  podcasts, 
  products, 
  favorites, 
  affiliateClicks, 
  orders, 
  reviews,
  insertPodcastSchema,
  insertProductSchema,
  insertFavoriteSchema,
  insertAffiliateClickSchema,
  insertOrderSchema,
  insertReviewSchema
} from "@shared/schema.js";
import { eq, desc, and, count, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export function setupRoutes(app: Express) {
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const result = await db.select().from(podcasts).limit(1);
      res.json({ 
        status: "healthy", 
        database: "connected",
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      res.status(500).json({ 
        status: "unhealthy", 
        error: "Database connection failed",
        timestamp: new Date().toISOString() 
      });
    }
  });

  // PODCAST ROUTES
  
  // Get all podcasts
  app.get("/api/podcasts", async (req, res) => {
    try {
      const allPodcasts = await db
        .select()
        .from(podcasts)
        .where(eq(podcasts.isActive, true))
        .orderBy(desc(podcasts.createdAt));
      
      res.json(allPodcasts);
    } catch (error) {
      console.error("Error fetching podcasts:", error);
      res.status(500).json({ error: "Failed to fetch podcasts" });
    }
  });

  // Get single podcast by slug
  app.get("/api/podcasts/:slug", async (req, res) => {
    try {
      const podcast = await db
        .select()
        .from(podcasts)
        .where(eq(podcasts.slug, req.params.slug))
        .limit(1);
      
      if (podcast.length === 0) {
        return res.status(404).json({ error: "Podcast not found" });
      }
      
      res.json(podcast[0]);
    } catch (error) {
      console.error("Error fetching podcast:", error);
      res.status(500).json({ error: "Failed to fetch podcast" });
    }
  });

  // Create new podcast (admin only)
  app.post("/api/podcasts", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const podcastData = insertPodcastSchema.parse(req.body);
      
      const newPodcast = await db
        .insert(podcasts)
        .values({
          id: randomUUID(),
          ...podcastData,
        })
        .returning();
      
      res.status(201).json(newPodcast[0]);
    } catch (error) {
      console.error("Error creating podcast:", error);
      res.status(400).json({ error: "Failed to create podcast" });
    }
  });

  // PRODUCT ROUTES
  
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const { podcast, category, limit = "20", offset = "0" } = req.query;
      
      // Build where conditions dynamically
      const conditions = [eq(products.isActive, true)];
      
      if (podcast) {
        conditions.push(eq(products.podcastId, podcast as string));
      }
      
      if (category) {
        conditions.push(eq(products.category, category as string));
      }
      
      const allProducts = await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          images: products.images,
          category: products.category,
          sizes: products.sizes,
          colors: products.colors,
          inventory: products.inventory,
          podcastId: products.podcastId,
          affiliateUrl: products.affiliateUrl,
          createdAt: products.createdAt,
          podcast: {
            id: podcasts.id,
            name: podcasts.name,
            slug: podcasts.slug,
            logo: podcasts.logo,
          }
        })
        .from(products)
        .leftJoin(podcasts, eq(products.podcastId, podcasts.id))
        .where(and(...conditions))
        .orderBy(desc(products.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      
      res.json(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await db
        .select({
          id: products.id,
          name: products.name,
          description: products.description,
          price: products.price,
          images: products.images,
          category: products.category,
          sizes: products.sizes,
          colors: products.colors,
          inventory: products.inventory,
          podcastId: products.podcastId,
          affiliateUrl: products.affiliateUrl,
          createdAt: products.createdAt,
          podcast: {
            id: podcasts.id,
            name: podcasts.name,
            slug: podcasts.slug,
            logo: podcasts.logo,
          }
        })
        .from(products)
        .leftJoin(podcasts, eq(products.podcastId, podcasts.id))
        .where(eq(products.id, req.params.id))
        .limit(1);
      
      if (product.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product[0]);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Create new product (admin only)
  app.post("/api/products", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      const newProduct = await db
        .insert(products)
        .values({
          id: randomUUID(),
          ...productData,
        })
        .returning();
      
      res.status(201).json(newProduct[0]);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ error: "Failed to create product" });
    }
  });

  // FAVORITES ROUTES
  
  // Get user favorites
  app.get("/api/favorites", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const userFavorites = await db
        .select({
          productId: favorites.productId,
          createdAt: favorites.createdAt,
          product: {
            id: products.id,
            name: products.name,
            price: products.price,
            images: products.images,
            category: products.category,
          }
        })
        .from(favorites)
        .leftJoin(products, eq(favorites.productId, products.id))
        .where(eq(favorites.userId, req.user.id))
        .orderBy(desc(favorites.createdAt));
      
      res.json(userFavorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  // Add to favorites
  app.post("/api/favorites", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const favoriteData = insertFavoriteSchema.parse({
        userId: req.user.id,
        productId: req.body.productId,
      });
      
      const newFavorite = await db
        .insert(favorites)
        .values(favoriteData)
        .returning();
      
      res.status(201).json(newFavorite[0]);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(400).json({ error: "Failed to add favorite" });
    }
  });

  // Remove from favorites
  app.delete("/api/favorites/:productId", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      await db
        .delete(favorites)
        .where(
          and(
            eq(favorites.userId, req.user.id),
            eq(favorites.productId, req.params.productId)
          )
        );
      
      res.json({ message: "Favorite removed successfully" });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  // AFFILIATE CLICK TRACKING
  
  // Track affiliate click
  app.post("/api/clicks", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const clickData = insertAffiliateClickSchema.parse({
        userId: req.user?.id || null,
        productId: req.body.productId,
        podcastId: req.body.podcastId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer'),
      });
      
      const newClick = await db
        .insert(affiliateClicks)
        .values({
          id: randomUUID(),
          ...clickData,
        })
        .returning();
      
      res.status(201).json(newClick[0]);
    } catch (error) {
      console.error("Error tracking click:", error);
      res.status(400).json({ error: "Failed to track click" });
    }
  });

  // ORDERS ROUTES
  
  // Create order
  app.post("/api/orders", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const orderData = insertOrderSchema.parse({
        userId: req.user?.id || null,
        ...req.body,
      });
      
      const newOrder = await db
        .insert(orders)
        .values({
          id: randomUUID(),
          ...orderData,
        })
        .returning();
      
      res.status(201).json(newOrder[0]);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ error: "Failed to create order" });
    }
  });

  // Get user orders
  app.get("/api/orders", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const userOrders = await db
        .select({
          id: orders.id,
          quantity: orders.quantity,
          price: orders.price,
          commission: orders.commission,
          status: orders.status,
          createdAt: orders.createdAt,
          product: {
            id: products.id,
            name: products.name,
            images: products.images,
          },
          podcast: {
            id: podcasts.id,
            name: podcasts.name,
          }
        })
        .from(orders)
        .leftJoin(products, eq(orders.productId, products.id))
        .leftJoin(podcasts, eq(orders.podcastId, podcasts.id))
        .where(eq(orders.userId, req.user.id))
        .orderBy(desc(orders.createdAt));
      
      res.json(userOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // REVIEWS ROUTES
  
  // Get product reviews
  app.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const productReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.productId, req.params.productId))
        .orderBy(desc(reviews.createdAt));
      
      res.json(productReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Create review
  app.post("/api/reviews", async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    try {
      const reviewData = insertReviewSchema.parse({
        userId: req.user.id,
        ...req.body,
      });
      
      const newReview = await db
        .insert(reviews)
        .values({
          id: randomUUID(),
          ...reviewData,
        })
        .returning();
      
      res.status(201).json(newReview[0]);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ error: "Failed to create review" });
    }
  });

  // DASHBOARD/ANALYTICS ROUTES
  
  // Get podcast analytics
  app.get("/api/analytics/:podcastId", async (req, res) => {
    try {
      const podcastId = req.params.podcastId;
      
      // Get click analytics
      const clickStats = await db
        .select({
          total: count(affiliateClicks.id),
          date: sql`DATE(${affiliateClicks.clickedAt})`.as('date')
        })
        .from(affiliateClicks)
        .where(eq(affiliateClicks.podcastId, podcastId))
        .groupBy(sql`DATE(${affiliateClicks.clickedAt})`)
        .orderBy(sql`DATE(${affiliateClicks.clickedAt}) DESC`)
        .limit(30);
      
      // Get order stats
      const orderStats = await db
        .select({
          total: count(orders.id),
          revenue: sql`SUM(${orders.price})`.as('revenue'),
          commission: sql`SUM(${orders.commission})`.as('commission')
        })
        .from(orders)
        .where(eq(orders.podcastId, podcastId));
      
      res.json({
        clicks: clickStats,
        orders: orderStats[0] || { total: 0, revenue: 0, commission: 0 }
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Get categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await db
        .select({ category: products.category })
        .from(products)
        .where(eq(products.isActive, true))
        .groupBy(products.category);
      
      res.json(categories.map(c => c.category));
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
}
