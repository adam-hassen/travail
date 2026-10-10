import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Statut de publication d'un livre
export const bookStatusEnum = pgEnum("book_status", [
  "draft", // pas encore programmé
  "scheduled", // date de sortie fixée, pas encore publié
  "published", // publié sur Shopify + réseaux sociaux
]);

export const series = pgTable("series", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  coverUrl: text("cover_url"),

  // Rattachement à une série (nullable : un livre peut être indépendant)
  seriesId: uuid("series_id").references(() => series.id, {
    onDelete: "set null",
  }),
  orderInSeries: integer("order_in_series"), // 1, 2, 3... position dans la série

  // Planification
  publishDate: timestamp("publish_date"), // null tant que pas programmé
  status: bookStatusEnum("status").notNull().default("draft"),

  // Rempli plus tard, une fois les tokens Shopify récupérés
  shopifyProductId: text("shopify_product_id"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Cache local des commandes (utile pour le futur moteur de suggestion panier)
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  shopifyOrderId: text("shopify_order_id").notNull().unique(),
  bookId: uuid("book_id")
    .notNull()
    .references(() => books.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations (pratique pour les requêtes avec .query)
export const seriesRelations = relations(series, ({ many }) => ({
  books: many(books),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  series: one(series, {
    fields: [books.seriesId],
    references: [series.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  book: one(books, {
    fields: [orders.bookId],
    references: [books.id],
  }),
}));
