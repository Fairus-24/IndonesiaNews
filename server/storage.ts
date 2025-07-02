import {
  users,
  articles,
  categories,
  comments,
  likes,
  bookmarks,
  siteSettings,
  type User,
  type InsertUser,
  type Article,
  type InsertArticle,
  type Category,
  type InsertCategory,
  type Comment,
  type InsertComment,
  type Like,
  type InsertLike,
  type Bookmark,
  type InsertBookmark,
  type SiteSetting,
  type InsertSiteSetting,
  type ArticleWithDetails,
  type CommentWithAuthor,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, count, sql, or } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: number, role: string): Promise<User>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(
    id: number,
    updates: Partial<InsertCategory>
  ): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Article methods
  getArticles(
    page: number,
    limit: number,
    categorySlug?: string,
    search?: string,
    published?: boolean
  ): Promise<{ articles: ArticleWithDetails[]; total: number }>;
  getArticleById(id: number): Promise<ArticleWithDetails | undefined>;
  getArticleBySlug(slug: string): Promise<ArticleWithDetails | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, updates: Partial<InsertArticle>): Promise<Article>;
  deleteArticle(id: number): Promise<void>;

  // Comment methods
  getCommentsByArticleId(articleId: number): Promise<CommentWithAuthor[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, updates: Partial<InsertComment>): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
  getPendingComments(): Promise<CommentWithAuthor[]>;
  getAllComments(): Promise<CommentWithAuthor[]>;
  getUserById(id: number): Promise<User | null>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;

  // Like methods
  toggleLike(userId: number, articleId: number): Promise<boolean>;
  getUserLikes(userId: number): Promise<Like[]>;

  // Bookmark methods
  toggleBookmark(userId: number, articleId: number): Promise<boolean>;
  getUserBookmarks(
    userId: number,
    page: number,
    limit: number
  ): Promise<{ bookmarks: ArticleWithDetails[]; total: number }>;

  // Site settings methods
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  getAllSiteSettings(): Promise<SiteSetting[]>;
  setSiteSetting(data: InsertSiteSetting): Promise<SiteSetting>;
  deleteSiteSetting(key: string): Promise<void>;

  // Statistics methods
  getStatistics(): Promise<{
    totalArticles: number;
    totalUsers: number;
    totalComments: number;
    totalLikes: number;
    totalBookmarks: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users);
    return result;
  }

  async updateUserRole(id: number, role: string): Promise<User> {
    if (!["USER", "ADMIN", "DEVELOPER"].includes(role)) {
      throw new Error("Role tidak valid");
    }
    const [user] = await db
      .update(users)
      .set({ role: role as "USER" | "ADMIN" | "DEVELOPER" })
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new Error("User tidak ditemukan");
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateCategory(
    id: number,
    updates: Partial<InsertCategory>
  ): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getArticles(
    page: number = 1,
    limit: number = 10,
    categorySlug?: string,
    search?: string,
    published?: boolean
  ): Promise<{ articles: ArticleWithDetails[]; total: number }> {
    let whereConditions = [];

    if (published !== undefined) {
      whereConditions.push(eq(articles.isPublished, published));
    }

    if (categorySlug) {
      const category = await this.getCategoryBySlug(categorySlug);
      if (category) {
        whereConditions.push(eq(articles.categoryId, category.id));
      }
    }

    if (search) {
      const searchLower = search.toLowerCase();
      whereConditions.push(
        or(
          sql`LOWER(${articles.title}) LIKE ${"%" + searchLower + "%"}`,
          sql`LOWER(${articles.content}) LIKE ${"%" + searchLower + "%"}`,
          sql`LOWER(${articles.excerpt}) LIKE ${"%" + searchLower + "%"}`
        )
      );
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [articlesResult, totalResult] = await Promise.all([
      db
        .select({
          article: articles,
          author: users,
          category: categories,
          likesCount: count(likes.id),
          commentsCount: count(comments.id),
          bookmarksCount: count(bookmarks.id),
        })
        .from(articles)
        .leftJoin(users, eq(articles.authorId, users.id))
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .leftJoin(likes, eq(articles.id, likes.articleId))
        .leftJoin(
          comments,
          and(
            eq(articles.id, comments.articleId),
            eq(comments.isApproved, true)
          )
        )
        .leftJoin(bookmarks, eq(articles.id, bookmarks.articleId))
        .where(whereClause)
        .groupBy(articles.id, users.id, categories.id)
        .orderBy(desc(articles.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),

      db.select({ count: count() }).from(articles).where(whereClause),
    ]);

    const articlesWithDetails: ArticleWithDetails[] = articlesResult.map(
      (row) => ({
        ...row.article,
        author: row.author!,
        category: row.category!,
        _count: {
          likes: Number(row.likesCount) || 0,
          comments: Number(row.commentsCount) || 0,
          bookmarks: Number(row.bookmarksCount) || 0,
        },
      })
    );

    return {
      articles: articlesWithDetails,
      total: totalResult[0]?.count || 0,
    };
  }

  async getArticleById(id: number): Promise<ArticleWithDetails | undefined> {
    const result = await db
      .select({
        article: articles,
        author: users,
        category: categories,
        likesCount: count(likes.id),
        commentsCount: count(comments.id),
        bookmarksCount: count(bookmarks.id),
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(likes, eq(articles.id, likes.articleId))
      .leftJoin(
        comments,
        and(eq(articles.id, comments.articleId), eq(comments.isApproved, true))
      )
      .leftJoin(bookmarks, eq(articles.id, bookmarks.articleId))
      .where(eq(articles.id, id))
      .groupBy(articles.id, users.id, categories.id);

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.article,
      author: row.author!,
      category: row.category!,
      _count: {
        likes: Number(row.likesCount) || 0,
        comments: Number(row.commentsCount) || 0,
        bookmarks: Number(row.bookmarksCount) || 0,
      },
    };
  }

  async getArticleBySlug(
    slug: string
  ): Promise<ArticleWithDetails | undefined> {
    const result = await db
      .select({
        article: articles,
        author: users,
        category: categories,
        likesCount: count(likes.id),
        commentsCount: count(comments.id),
        bookmarksCount: count(bookmarks.id),
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .leftJoin(categories, eq(articles.categoryId, categories.id))
      .leftJoin(likes, eq(articles.id, likes.articleId))
      .leftJoin(
        comments,
        and(eq(articles.id, comments.articleId), eq(comments.isApproved, true))
      )
      .leftJoin(bookmarks, eq(articles.id, bookmarks.articleId))
      .where(eq(articles.slug, slug))
      .groupBy(articles.id, users.id, categories.id);

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.article,
      author: row.author!,
      category: row.category!,
      _count: {
        likes: Number(row.likesCount) || 0,
        comments: Number(row.commentsCount) || 0,
        bookmarks: Number(row.bookmarksCount) || 0,
      },
    };
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db
      .insert(articles)
      .values(insertArticle)
      .returning();
    return article;
  }

  async updateArticle(
    id: number,
    updates: Partial<InsertArticle>
  ): Promise<Article> {
    const [article] = await db
      .update(articles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return article;
  }

  async deleteArticle(id: number): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  async getCommentsByArticleId(
    articleId: number
  ): Promise<CommentWithAuthor[]> {
    const result = await db
      .select({
        comment: comments,
        author: users,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(
        and(eq(comments.articleId, articleId), eq(comments.isApproved, true))
      )
      .orderBy(desc(comments.createdAt));

    return result.map((row) => ({
      ...row.comment,
      author: row.author!,
    }));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    // Daftar kata buruk/kasar/umum (bisa dikembangkan)
    const badWords = [
      "anjing",
      "babi",
      "bangsat",
      "kontol",
      "memek",
      "asu",
      "goblok",
      "tolol",
      "idiot",
      "bodoh",
      "kampret",
      "fuck",
      "shit",
      "bitch",
      "bastard",
      "dick",
      "pussy",
      "asshole",
      "faggot",
      "cunt",
      "ngentot",
      "pepek",
      "jancok",
      "tai",
      "cok",
      // ... tambahkan kata lain sesuai kebutuhan
    ];

    // Deteksi kata buruk/kasar
    const content = insertComment.content.toLowerCase();
    const hasBadWord = badWords.some((word) => content.includes(word));

    // Deteksi komentar robot/spam sederhana (bisa dikembangkan)
    const isLikelyBot =
      /http(s)?:\/\//.test(content) || // ada link
      content.length < 5 || // terlalu pendek
      /[a-zA-Z0-9]{30,}/.test(content); // string acak panjang

    // Otomatisasi moderasi
    let isApproved = false;
    if (!hasBadWord && !isLikelyBot) {
      isApproved = true;
    }

    const [comment] = await db
      .insert(comments)
      .values({
        ...insertComment,
        isApproved,
      })
      .returning();
    return comment;
  }

  async updateComment(
    id: number,
    updates: Partial<InsertComment>
  ): Promise<Comment> {
    const [comment] = await db
      .update(comments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(comments.id, id))
      .returning();
    return comment;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async getAllComments(): Promise<CommentWithAuthor[]> {
    const result = await db
      .select({
        comment: comments,
        author: users,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .orderBy(desc(comments.createdAt));

    return result.map((row) => ({
      ...row.comment,
      author: row.author!,
    }));
  }

  async getUserById(id: number): Promise<User | null> {
    // Select semua kolom, pastikan password ikut diambil
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        role: users.role,
        fullName: users.fullName,
        avatar: users.avatar,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id));
    return user || null;
  }

  async getPendingComments(): Promise<CommentWithAuthor[]> {
    const result = await db
      .select({
        comment: comments,
        author: users,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.isApproved, false))
      .orderBy(desc(comments.createdAt));

    return result.map((row) => ({
      ...row.comment,
      author: row.author!,
    }));
  }

  async toggleLike(userId: number, articleId: number): Promise<boolean> {
    const [existingLike] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.articleId, articleId)));

    if (existingLike) {
      await db.delete(likes).where(eq(likes.id, existingLike.id));
      return false;
    } else {
      await db.insert(likes).values({ userId, articleId });
      return true;
    }
  }

  async getUserLikes(userId: number): Promise<Like[]> {
    return await db.select().from(likes).where(eq(likes.userId, userId));
  }

  async toggleBookmark(userId: number, articleId: number): Promise<boolean> {
    const [existingBookmark] = await db
      .select()
      .from(bookmarks)
      .where(
        and(eq(bookmarks.userId, userId), eq(bookmarks.articleId, articleId))
      );

    if (existingBookmark) {
      await db.delete(bookmarks).where(eq(bookmarks.id, existingBookmark.id));
      return false;
    } else {
      await db.insert(bookmarks).values({ userId, articleId });
      return true;
    }
  }

  async getUserBookmarks(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ bookmarks: ArticleWithDetails[]; total: number }> {
    const [bookmarksResult, totalResult] = await Promise.all([
      db
        .select({
          article: articles,
          author: users,
          category: categories,
          likesCount: count(likes.id),
          commentsCount: count(comments.id),
          bookmarksCount: count(bookmarks.id),
        })
        .from(bookmarks)
        .leftJoin(articles, eq(bookmarks.articleId, articles.id))
        .leftJoin(users, eq(articles.authorId, users.id))
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .leftJoin(likes, eq(articles.id, likes.articleId))
        .leftJoin(
          comments,
          and(
            eq(articles.id, comments.articleId),
            eq(comments.isApproved, true)
          )
        )
        .where(eq(bookmarks.userId, userId))
        .groupBy(articles.id, users.id, categories.id, bookmarks.id)
        .orderBy(desc(bookmarks.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ count: count() })
        .from(bookmarks)
        .where(eq(bookmarks.userId, userId)),
    ]);

    const bookmarksWithDetails: ArticleWithDetails[] = bookmarksResult.map(
      (row) => ({
        ...row.article!,
        author: row.author!,
        category: row.category!,
        _count: {
          likes: Number(row.likesCount) || 0,
          comments: Number(row.commentsCount) || 0,
          bookmarks: Number(row.bookmarksCount) || 0,
        },
      })
    );

    return {
      bookmarks: bookmarksWithDetails,
      total: totalResult[0]?.count || 0,
    };
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key));
    return setting || undefined;
  }

  async getAllSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings).orderBy(siteSettings.key);
  }

  async setSiteSetting(data: InsertSiteSetting): Promise<SiteSetting> {
    const existing = await this.getSiteSetting(data.key);

    if (existing) {
      // Update existing setting
      const result = await db
        .update(siteSettings)
        .set({
          value: data.value,
          description: data.description,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.key, data.key))
        .returning();
      return result[0];
    } else {
      // Create new setting
      const result = await db.insert(siteSettings).values(data).returning();
      return result[0];
    }
  }

  async deleteSiteSetting(key: string): Promise<void> {
    await db.delete(siteSettings).where(eq(siteSettings.key, key));
  }

  async getStatistics(): Promise<{
    totalArticles: number;
    totalUsers: number;
    totalComments: number;
    totalLikes: number;
    totalBookmarks: number;
  }> {
    const [articlesCount] = await db.select({ count: count() }).from(articles);
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [commentsCount] = await db.select({ count: count() }).from(comments);
    const [likesCount] = await db.select({ count: count() }).from(likes);
    const [bookmarksCount] = await db
      .select({ count: count() })
      .from(bookmarks);

    return {
      totalArticles: Number(articlesCount.count) || 0,
      totalUsers: Number(usersCount.count) || 0,
      totalComments: Number(commentsCount.count) || 0,
      totalLikes: Number(likesCount.count) || 0,
      totalBookmarks: Number(bookmarksCount.count) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
