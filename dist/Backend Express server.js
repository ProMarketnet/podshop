var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/Backend Express server
import express2 from "express";

// server/vite.ts
import { createServer as createViteServer } from "vite";
import express from "express";
import fs from "fs";
import path from "path";
async function setupVite(app2) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa"
  });
  app2.use(vite.ssrFixStacktrace);
  app2.use(vite.middlewares);
}
function serveStatic(app2) {
  const distPath = path.resolve("dist/public");
  const indexPath = path.join(distPath, "index.html");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Static files not found at ${distPath}. Run 'npm run build' first.`
    );
  }
  app2.use(express.static(distPath));
  app2.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      res.status(404).json({ error: "API endpoint not found" });
    } else {
      res.sendFile(indexPath);
    }
  });
}

// server/Complete database operations interfacereplitAuth.ts
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

// server/server/storage.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  affiliateClicks: () => affiliateClicks,
  affiliateClicksRelations: () => affiliateClicksRelations,
  favorites: () => favorites,
  favoritesRelations: () => favoritesRelations,
  insertAffiliateClickSchema: () => insertAffiliateClickSchema,
  insertFavoriteSchema: () => insertFavoriteSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPodcastSchema: () => insertPodcastSchema,
  insertProductSchema: () => insertProductSchema,
  insertReviewSchema: () => insertReviewSchema,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  podcasts: () => podcasts,
  podcastsRelations: () => podcastsRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  reviews: () => reviews,
  reviewsRelations: () => reviewsRelations,
  sessions: () => sessions,
  users: () => users,
  usersRelations: () => usersRelations
});
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  decimal,
  boolean,
  primaryKey
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"),
  // user, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var podcasts = pgTable("podcasts", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique().notNull(),
  description: text("description"),
  logo: varchar("logo"),
  category: varchar("category").notNull(),
  hostName: varchar("host_name").notNull(),
  listenerCount: integer("listener_count"),
  isActive: boolean("is_active").default(true),
  commission: decimal("commission", { precision: 3, scale: 2 }).default("0.20"),
  partnerEmail: varchar("partner_email").notNull(),
  stripeAccountId: varchar("stripe_account_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var products = pgTable("products", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  images: text("images").array(),
  category: varchar("category").notNull(),
  sizes: text("sizes").array(),
  colors: text("colors").array(),
  inventory: integer("inventory").default(0),
  isActive: boolean("is_active").default(true),
  podcastId: varchar("podcast_id").notNull(),
  affiliateUrl: varchar("affiliate_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var favorites = pgTable(
  "favorites",
  {
    userId: varchar("user_id").notNull(),
    productId: varchar("product_id").notNull(),
    createdAt: timestamp("created_at").defaultNow()
  },
  (table) => [primaryKey({ columns: [table.userId, table.productId] })]
);
var affiliateClicks = pgTable("affiliate_clicks", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id"),
  productId: varchar("product_id").notNull(),
  podcastId: varchar("podcast_id").notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  referrer: varchar("referrer"),
  clickedAt: timestamp("clicked_at").defaultNow()
});
var orders = pgTable("orders", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id"),
  productId: varchar("product_id").notNull(),
  podcastId: varchar("podcast_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"),
  externalOrderId: varchar("external_order_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  productId: varchar("product_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  favorites: many(favorites),
  reviews: many(reviews),
  affiliateClicks: many(affiliateClicks),
  orders: many(orders)
}));
var podcastsRelations = relations(podcasts, ({ many }) => ({
  products: many(products),
  affiliateClicks: many(affiliateClicks),
  orders: many(orders)
}));
var productsRelations = relations(products, ({ one, many }) => ({
  podcast: one(podcasts, {
    fields: [products.podcastId],
    references: [podcasts.id]
  }),
  favorites: many(favorites),
  reviews: many(reviews),
  affiliateClicks: many(affiliateClicks),
  orders: many(orders)
}));
var favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [favorites.productId],
    references: [products.id]
  })
}));
var affiliateClicksRelations = relations(affiliateClicks, ({ one }) => ({
  user: one(users, {
    fields: [affiliateClicks.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [affiliateClicks.productId],
    references: [products.id]
  }),
  podcast: one(podcasts, {
    fields: [affiliateClicks.podcastId],
    references: [podcasts.id]
  })
}));
var ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id]
  }),
  podcast: one(podcasts, {
    fields: [orders.podcastId],
    references: [podcasts.id]
  })
}));
var reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id]
  })
}));
var insertPodcastSchema = createInsertSchema(podcasts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertFavoriteSchema = createInsertSchema(favorites).omit({
  createdAt: true
});
var insertAffiliateClickSchema = createInsertSchema(affiliateClicks).omit({
  id: true,
  clickedAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});

// server/server/storage.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Additional pool configuration for production
  max: 20,
  idleTimeoutMillis: 3e4,
  connectionTimeoutMillis: 2e3
});
var db = drizzle(pool, {
  schema: schema_exports,
  logger: process.env.NODE_ENV === "development"
});
async function closeDatabase() {
  try {
    await pool.end();
    console.log("Database connection pool closed");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
}
process.on("SIGINT", closeDatabase);
process.on("SIGTERM", closeDatabase);

// server/Complete database operations interfacereplitAuth.ts
import { eq } from "drizzle-orm";
import { neonConfig as neonConfig2, Pool as Pool2 } from "@neondatabase/serverless";
import ws2 from "ws";
var PgSession = connectPgSimple(session);
neonConfig2.webSocketConstructor = ws2;
var pool2 = new Pool2({ connectionString: process.env.DATABASE_URL });
function getBaseUrl() {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = process.env.RAILWAY_PUBLIC_DOMAIN || process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : "localhost:5000";
  return `${protocol}://${host}`;
}
async function setupAuth(app2) {
  app2.use(
    session({
      store: new PgSession({
        pool: pool2,
        tableName: "sessions",
        createTableIfMissing: false
      }),
      secret: process.env.SESSION_SECRET || "fallback-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1e3
        // 30 days
      }
    })
  );
  const issuer = await Issuer.discover("https://auth.replit.com");
  const client = new issuer.Client({
    client_id: process.env.REPL_ID || "",
    client_secret: "",
    redirect_uris: [`${getBaseUrl()}/api/auth/callback`],
    response_types: ["code"]
  });
  app2.get("/api/auth/login", (req, res) => {
    const state = generators.state();
    const nonce = generators.nonce();
    req.session.state = state;
    req.session.nonce = nonce;
    const authUrl = client.authorizationUrl({
      scope: "openid profile",
      state,
      nonce
    });
    res.redirect(authUrl);
  });
  app2.get("/api/auth/callback", async (req, res) => {
    try {
      const params = client.callbackParams(req);
      const tokenSet = await client.callback(
        `${getBaseUrl()}/api/auth/callback`,
        params,
        {
          state: req.session.state,
          nonce: req.session.nonce
        }
      );
      const userinfo = await client.userinfo(tokenSet);
      const userData = {
        id: userinfo.sub,
        email: userinfo.email || null,
        firstName: userinfo.given_name || null,
        lastName: userinfo.family_name || null,
        profileImageUrl: userinfo.picture || null
      };
      await db.insert(users).values(userData).onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: /* @__PURE__ */ new Date()
        }
      });
      req.session.userId = userinfo.sub;
      res.redirect("/");
    } catch (error) {
      console.error("Auth callback error:", error);
      res.redirect("/");
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
          role: true
        }
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.post("/api/auth/become-admin", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      await db.update(users).set({ role: "admin", updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
      res.json({ message: "Admin role granted" });
    } catch (error) {
      console.error("Become admin error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
}

// server/routes.ts
import { eq as eq2, desc, and, count, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
function setupRoutes(app2) {
  app2.get("/api/health", async (req, res) => {
    try {
      const result = await db.select().from(podcasts).limit(1);
      res.json({
        status: "healthy",
        database: "connected",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      res.status(500).json({
        status: "unhealthy",
        error: "Database connection failed",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  });
  app2.get("/api/podcasts", async (req, res) => {
    try {
      const allPodcasts = await db.select().from(podcasts).where(eq2(podcasts.isActive, true)).orderBy(desc(podcasts.createdAt));
      res.json(allPodcasts);
    } catch (error) {
      console.error("Error fetching podcasts:", error);
      res.status(500).json({ error: "Failed to fetch podcasts" });
    }
  });
  app2.get("/api/podcasts/:slug", async (req, res) => {
    try {
      const podcast = await db.select().from(podcasts).where(eq2(podcasts.slug, req.params.slug)).limit(1);
      if (podcast.length === 0) {
        return res.status(404).json({ error: "Podcast not found" });
      }
      res.json(podcast[0]);
    } catch (error) {
      console.error("Error fetching podcast:", error);
      res.status(500).json({ error: "Failed to fetch podcast" });
    }
  });
  app2.post("/api/podcasts", async (req, res) => {
    try {
      const podcastData = insertPodcastSchema.parse(req.body);
      const newPodcast = await db.insert(podcasts).values({
        id: randomUUID(),
        ...podcastData
      }).returning();
      res.status(201).json(newPodcast[0]);
    } catch (error) {
      console.error("Error creating podcast:", error);
      res.status(400).json({ error: "Failed to create podcast" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const { podcast, category, limit = "20", offset = "0" } = req.query;
      const conditions = [eq2(products.isActive, true)];
      if (podcast) {
        conditions.push(eq2(products.podcastId, podcast));
      }
      if (category) {
        conditions.push(eq2(products.category, category));
      }
      const allProducts = await db.select({
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
          logo: podcasts.logo
        }
      }).from(products).leftJoin(podcasts, eq2(products.podcastId, podcasts.id)).where(and(...conditions)).orderBy(desc(products.createdAt)).limit(parseInt(limit)).offset(parseInt(offset));
      res.json(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const product = await db.select({
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
          logo: podcasts.logo
        }
      }).from(products).leftJoin(podcasts, eq2(products.podcastId, podcasts.id)).where(eq2(products.id, req.params.id)).limit(1);
      if (product.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product[0]);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
  app2.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const newProduct = await db.insert(products).values({
        id: randomUUID(),
        ...productData
      }).returning();
      res.status(201).json(newProduct[0]);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ error: "Failed to create product" });
    }
  });
  app2.get("/api/favorites", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const userFavorites = await db.select({
        productId: favorites.productId,
        createdAt: favorites.createdAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          images: products.images,
          category: products.category
        }
      }).from(favorites).leftJoin(products, eq2(favorites.productId, products.id)).where(eq2(favorites.userId, req.user.id)).orderBy(desc(favorites.createdAt));
      res.json(userFavorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });
  app2.post("/api/favorites", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const favoriteData = insertFavoriteSchema.parse({
        userId: req.user.id,
        productId: req.body.productId
      });
      const newFavorite = await db.insert(favorites).values(favoriteData).returning();
      res.status(201).json(newFavorite[0]);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(400).json({ error: "Failed to add favorite" });
    }
  });
  app2.delete("/api/favorites/:productId", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      await db.delete(favorites).where(
        and(
          eq2(favorites.userId, req.user.id),
          eq2(favorites.productId, req.params.productId)
        )
      );
      res.json({ message: "Favorite removed successfully" });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });
  app2.post("/api/clicks", async (req, res) => {
    try {
      const clickData = insertAffiliateClickSchema.parse({
        userId: req.user?.id || null,
        productId: req.body.productId,
        podcastId: req.body.podcastId,
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        referrer: req.get("Referer")
      });
      const newClick = await db.insert(affiliateClicks).values({
        id: randomUUID(),
        ...clickData
      }).returning();
      res.status(201).json(newClick[0]);
    } catch (error) {
      console.error("Error tracking click:", error);
      res.status(400).json({ error: "Failed to track click" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse({
        userId: req.user?.id || null,
        ...req.body
      });
      const newOrder = await db.insert(orders).values({
        id: randomUUID(),
        ...orderData
      }).returning();
      res.status(201).json(newOrder[0]);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ error: "Failed to create order" });
    }
  });
  app2.get("/api/orders", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const userOrders = await db.select({
        id: orders.id,
        quantity: orders.quantity,
        price: orders.price,
        commission: orders.commission,
        status: orders.status,
        createdAt: orders.createdAt,
        product: {
          id: products.id,
          name: products.name,
          images: products.images
        },
        podcast: {
          id: podcasts.id,
          name: podcasts.name
        }
      }).from(orders).leftJoin(products, eq2(orders.productId, products.id)).leftJoin(podcasts, eq2(orders.podcastId, podcasts.id)).where(eq2(orders.userId, req.user.id)).orderBy(desc(orders.createdAt));
      res.json(userOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });
  app2.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const productReviews = await db.select().from(reviews).where(eq2(reviews.productId, req.params.productId)).orderBy(desc(reviews.createdAt));
      res.json(productReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });
  app2.post("/api/reviews", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const reviewData = insertReviewSchema.parse({
        userId: req.user.id,
        ...req.body
      });
      const newReview = await db.insert(reviews).values({
        id: randomUUID(),
        ...reviewData
      }).returning();
      res.status(201).json(newReview[0]);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ error: "Failed to create review" });
    }
  });
  app2.get("/api/analytics/:podcastId", async (req, res) => {
    try {
      const podcastId = req.params.podcastId;
      const clickStats = await db.select({
        total: count(affiliateClicks.id),
        date: sql`DATE(${affiliateClicks.clickedAt})`.as("date")
      }).from(affiliateClicks).where(eq2(affiliateClicks.podcastId, podcastId)).groupBy(sql`DATE(${affiliateClicks.clickedAt})`).orderBy(sql`DATE(${affiliateClicks.clickedAt}) DESC`).limit(30);
      const orderStats = await db.select({
        total: count(orders.id),
        revenue: sql`SUM(${orders.price})`.as("revenue"),
        commission: sql`SUM(${orders.commission})`.as("commission")
      }).from(orders).where(eq2(orders.podcastId, podcastId));
      res.json({
        clicks: clickStats,
        orders: orderStats[0] || { total: 0, revenue: 0, commission: 0 }
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories = await db.select({ category: products.category }).from(products).where(eq2(products.isActive, true)).groupBy(products.category);
      res.json(categories.map((c) => c.category));
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });
}

// server/Backend Express server
var app = express2();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-id"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: true, limit: "50mb" }));
setupAuth(app);
setupRoutes(app);
if (process.env.NODE_ENV === "production") {
  serveStatic(app);
} else {
  setupVite(app);
}
var PORT = Number(process.env.PORT || 5e3);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
