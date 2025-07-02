import { PrismaClient, User, Category, Article, Comment, Like, Bookmark, SiteSetting } from '@prisma/client';
import { prisma } from './db';
import { InsertUser, InsertCategory, InsertArticle, InsertComment, InsertSiteSetting } from '@shared/schema';

export class DatabaseStorage {
  // User methods
  async getUser(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
  async getUserByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  }
  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }
  async createUser(user: InsertUser): Promise<User> {
    return prisma.user.create({ data: user });
  }
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    return prisma.user.update({ where: { id }, data: { ...updates, updatedAt: new Date() } });
  }
  async getAllUsers(): Promise<User[]> {
    return prisma.user.findMany();
  }
  async updateUserRole(id: number, role: string): Promise<User> {
    if (!['USER', 'ADMIN', 'DEVELOPER'].includes(role)) throw new Error('Role tidak valid');
    return prisma.user.update({ where: { id }, data: { role } });
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  }
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { slug } });
  }
  async createCategory(category: InsertCategory): Promise<Category> {
    return prisma.category.create({ data: category });
  }
  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category> {
    return prisma.category.update({ where: { id }, data: updates });
  }
  async deleteCategory(id: number): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }

  // Article methods
  async getArticles(page = 1, limit = 10, categorySlug?: string, search?: string, published?: boolean): Promise<{ articles: any[]; total: number }> {
    const where: any = {
      ...(published !== undefined ? { isPublished: published } : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(search ? { OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ] } : {}),
    };
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: { author: true, category: true, likes: true, comments: true, bookmarks: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);
    const articlesWithDetails = articles.map((article: any) => ({
      ...article,
      _count: {
        likes: article.likes.length,
        comments: article.comments.filter((c: any) => c.isApproved).length,
        bookmarks: article.bookmarks.length,
      },
    }));
    return { articles: articlesWithDetails, total };
  }
  async getArticleById(id: number): Promise<any | undefined> {
    const article = await prisma.article.findUnique({
      where: { id },
      include: { author: true, category: true, likes: true, comments: true, bookmarks: true },
    });
    if (!article) return undefined;
    return {
      ...article,
      _count: {
        likes: article.likes.length,
        comments: article.comments.filter((c: any) => c.isApproved).length,
        bookmarks: article.bookmarks.length,
      },
    };
  }
  async getArticleBySlug(slug: string): Promise<any | undefined> {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: { author: true, category: true, likes: true, comments: true, bookmarks: true },
    });
    if (!article) return undefined;
    return {
      ...article,
      _count: {
        likes: article.likes.length,
        comments: article.comments.filter((c: any) => c.isApproved).length,
        bookmarks: article.bookmarks.length,
      },
    };
  }
  async createArticle(article: InsertArticle): Promise<Article> {
    return prisma.article.create({ data: article });
  }
  async updateArticle(id: number, updates: Partial<InsertArticle>): Promise<Article> {
    return prisma.article.update({ where: { id }, data: { ...updates, updatedAt: new Date() } });
  }
  async deleteArticle(id: number): Promise<void> {
    await prisma.article.delete({ where: { id } });
  }

  // Comment methods
  async getCommentsByArticleId(articleId: number): Promise<any[]> {
    const comments = await prisma.comment.findMany({
      where: { articleId, isApproved: true },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });
    return comments.map((comment: any) => ({ ...comment, author: comment.author }));
  }
  async createComment(comment: InsertComment): Promise<Comment> {
    // Daftar kata buruk/kasar/umum (bisa dikembangkan)
    const badWords = [
      'anjing','babi','bangsat','kontol','memek','asu','goblok','tolol','idiot','bodoh','kampret','fuck','shit','bitch','bastard','dick','pussy','asshole','faggot','cunt','ngentot','pepek','jancok','tai','cok',
    ];

    // Deteksi kata buruk/kasar
    const content = comment.content.toLowerCase();
    const hasBadWord = badWords.some(word => content.includes(word));

    // Deteksi komentar robot/spam sederhana (bisa dikembangkan)
    const isLikelyBot = /http(s)?:\/\//.test(content) || content.length < 5 || /[a-zA-Z0-9]{30,}/.test(content);

    // Otomatisasi moderasi
    let isApproved = false;
    if (!hasBadWord && !isLikelyBot) isApproved = true;

    return prisma.comment.create({ data: { ...comment, isApproved } });
  }
  async updateComment(id: number, updates: Partial<InsertComment>): Promise<Comment> {
    return prisma.comment.update({ where: { id }, data: { ...updates, updatedAt: new Date() } });
  }
  async deleteComment(id: number): Promise<void> {
    await prisma.comment.delete({ where: { id } });
  }
  async getAllComments(): Promise<any[]> {
    const comments = await prisma.comment.findMany({ include: { author: true }, orderBy: { createdAt: 'desc' } });
    return comments.map((comment: any) => ({ ...comment, author: comment.author }));
  }
  async getPendingComments(): Promise<any[]> {
    const comments = await prisma.comment.findMany({ where: { isApproved: false }, include: { author: true }, orderBy: { createdAt: 'desc' } });
    return comments.map((comment: any) => ({ ...comment, author: comment.author }));
  }
  async getUserById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  // Like methods
  async toggleLike(userId: number, articleId: number): Promise<boolean> {
    const existing = await prisma.like.findFirst({ where: { userId, articleId } });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return false;
    } else {
      await prisma.like.create({ data: { userId, articleId } });
      return true;
    }
  }
  async getUserLikes(userId: number): Promise<Like[]> {
    return prisma.like.findMany({ where: { userId } });
  }

  // Bookmark methods
  async toggleBookmark(userId: number, articleId: number): Promise<boolean> {
    const existing = await prisma.bookmark.findFirst({ where: { userId, articleId } });
    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return false;
    } else {
      await prisma.bookmark.create({ data: { userId, articleId } });
      return true;
    }
  }
  async getUserBookmarks(userId: number, page = 1, limit = 10): Promise<{ bookmarks: any[]; total: number }> {
    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId },
        include: { article: { include: { author: true, category: true, likes: true, comments: true, bookmarks: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.bookmark.count({ where: { userId } }),
    ]);
    const bookmarksWithDetails = bookmarks.map((b: any) => ({
      ...b.article,
      _count: {
        likes: b.article.likes.length,
        comments: b.article.comments.filter((c: any) => c.isApproved).length,
        bookmarks: b.article.bookmarks.length,
      },
    }));
    return { bookmarks: bookmarksWithDetails, total };
  }

  // Site settings methods
  async getSiteSetting(key: string): Promise<SiteSetting | null> {
    return prisma.siteSetting.findUnique({ where: { key } });
  }
  async getAllSiteSettings(): Promise<SiteSetting[]> {
    return prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
  }
  async setSiteSetting(data: InsertSiteSetting): Promise<SiteSetting> {
    const existing = await prisma.siteSetting.findUnique({ where: { key: data.key } });
    const valueString = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
    if (existing) {
      return prisma.siteSetting.update({ where: { key: data.key }, data: { ...data, value: valueString, updatedAt: new Date() } });
    } else {
      return prisma.siteSetting.create({ data: { ...data, value: valueString } });
    }
  }
  async deleteSiteSetting(key: string): Promise<void> {
    await prisma.siteSetting.delete({ where: { key } });
  }

  // Statistics methods
  async getStatistics(): Promise<{ totalArticles: number; totalUsers: number; totalComments: number; totalLikes: number; totalBookmarks: number; }> {
    const [totalArticles, totalUsers, totalComments, totalLikes, totalBookmarks] = await Promise.all([
      prisma.article.count(),
      prisma.user.count(),
      prisma.comment.count(),
      prisma.like.count(),
      prisma.bookmark.count(),
    ]);
    return {
      totalArticles,
      totalUsers,
      totalComments,
      totalLikes,
      totalBookmarks,
    };
  }
}

export const storage = new DatabaseStorage();
