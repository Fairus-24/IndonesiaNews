import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["USER", "ADMIN", "DEVELOPER"] }).notNull().default("USER"),
  fullName: text("full_name").notNull(),
  avatar: text("avatar"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color").notNull().default("#DC2626"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Articles table
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  authorId: integer("author_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  articleId: integer("article_id").notNull().references(() => articles.id),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Likes table
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  articleId: integer("article_id").notNull().references(() => articles.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Bookmarks table
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  articleId: integer("article_id").notNull().references(() => articles.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Site settings table
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Audit log table untuk aksi user
export const userLogs = pgTable("user_logs", {
  id: serial("id").primaryKey(),
  actorId: integer("actor_id").notNull().references(() => users.id), // user yang melakukan aksi
  targetUserId: integer("target_user_id").notNull().references(() => users.id), // user yang diubah
  action: text("action").notNull(), // misal: 'change_role'
  detail: text("detail"), // misal: 'from USER to ADMIN'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  comments: many(comments),
  likes: many(likes),
  bookmarks: many(bookmarks),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
  comments: many(comments),
  likes: many(likes),
  bookmarks: many(bookmarks),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  article: one(articles, {
    fields: [likes.articleId],
    references: [articles.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  article: one(articles, {
    fields: [bookmarks.articleId],
    references: [articles.id],
  }),
}));

export const userLogsRelations = relations(userLogs, ({ one }) => ({
  actor: one(users, {
    fields: [userLogs.actorId],
    references: [users.id],
  }),
  targetUser: one(users, {
    fields: [userLogs.targetUserId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertUserLogSchema = createInsertSchema(userLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type UserLog = typeof userLogs.$inferSelect;

// Extended types for API responses
export type ArticleWithDetails = Article & {
  author: User;
  category: Category;
  _count: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
};

export type CommentWithAuthor = Comment & {
  author: User;
};
