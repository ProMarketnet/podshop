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
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const podcasts = pgTable("podcasts", {
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const favorites = pgTable(
  "favorites",
  {
    userId: varchar("user_id").notNull(),
    productId: varchar("product_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.productId] })],
);

export const affiliateClicks = pgTable("affiliate_clicks", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id"),
  productId: varchar("product_id").notNull(),
  podcastId: varchar("podcast_id").notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  referrer: varchar("referrer"),
  clickedAt: timestamp("clicked_at").defaultNow(),
});

export const orders = pgTable("orders", {
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  productId: varchar("product_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(favorites),
  reviews: many(reviews),
  affiliateClicks: many(affiliateClicks),
  orders: many(orders),
}));

export const podcastsRelations = relations(podcasts, ({ many }) => ({
  products: many(products),
  affiliateClicks: many(affiliateClicks),
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  podcast: one(podcasts, {
    fields: [products.podcastId],
    references: [podcasts.id],
  }),
  favorites: many(favorites),
  reviews: many(reviews),
  affiliateClicks: many(affiliateClicks),
  orders: many(orders),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [favorites.productId],
    references: [products.id],
  }),
}));

export const affiliateClicksRelations = relations(affiliateClicks, ({ one }) => ({
  user: one(users, {
    fields: [affiliateClicks.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [affiliateClicks.productId],
    references: [products.id],
  }),
  podcast: one(podcasts, {
    fields: [affiliateClicks.podcastId],
    references: [podcasts.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  podcast: one(podcasts, {
    fields: [orders.podcastId],
    references: [podcasts.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

// Insert schemas
export const insertPodcastSchema = createInsertSchema(podcasts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  createdAt: true,
});

export const insertAffiliateClickSchema = createInsertSchema(affiliateClicks).omit({
  id: true,
  clickedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertPodcast = z.infer<typeof insertPodcastSchema>;
export type Podcast = typeof podcasts.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertAffiliateClick = z.infer<typeof insertAffiliateClickSchema>;
export type AffiliateClick = typeof affiliateClicks.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect; 