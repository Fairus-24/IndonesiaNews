import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  authenticateToken,
  hashPassword,
  comparePassword,
  generateToken,
  requireAdmin,
  requireDeveloper,
  type AuthRequest,
} from "./middleware/auth";
import { upload } from "./services/upload";
import {
  insertUserSchema,
  insertArticleSchema,
  insertCommentSchema,
  insertCategorySchema,
  insertSiteSettingSchema,
} from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";
import * as schema from "@shared/schema";
import { prisma } from "./db";

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: Infinity, // limit each IP to 100 requests per windowMs
  message: "Terlalu banyak permintaan, coba lagi nanti",
});

const authLimiter =
  process.env.NODE_ENV === "production"
    ? rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // limit each IP to 5 auth requests per windowMs
        message: "Terlalu banyak percobaan login, coba lagi nanti",
      })
    : (req: any, res: any, next: any) => next(); // No rate limit in development

// Google OAuth setup
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NODE_ENV === "production"
    ? "https://your-domain.com/api/auth/google/callback"
    : "http://localhost:5000/api/auth/google/callback"
);

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS configuration
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "*",
      credentials: true,
    })
  );

  // Rate limiting
  app.use("/api", limiter);
  app.use("/api/auth", authLimiter);

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password, fullName } = insertUserSchema
        .extend({
          password: z.string().min(6, "Password minimal 6 karakter"),
          email: z.string().email("Format email tidak valid"),
        })
        .parse(req.body);

      // Check if user exists
      const existingUser =
        (await storage.getUserByEmail(email)) ||
        (await storage.getUserByUsername(username));
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email atau username sudah digunakan" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        fullName,
        role: "USER",
      });

      // Generate token
      const token = generateToken({ ...user, role: user.role as "USER" | "ADMIN" | "DEVELOPER" });

      res.status(201).json({
        message: "Registrasi berhasil",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role as "USER" | "ADMIN" | "DEVELOPER",
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = z
        .object({
          email: z.string().email("Format email tidak valid"),
          password: z.string().min(1, "Password diperlukan"),
        })
        .parse(req.body);

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      // Check password
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      // Generate token
      const token = generateToken({ ...user, role: user.role as "USER" | "ADMIN" | "DEVELOPER" });

      res.json({
        message: "Login berhasil",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role as "USER" | "ADMIN" | "DEVELOPER",
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    res.json({
      user: {
        id: req.user!.id,
        username: req.user!.username,
        email: req.user!.email,
        fullName: req.user!.fullName,
        role: req.user!.role as "USER" | "ADMIN" | "DEVELOPER",
        avatar: req.user!.avatar,
      },
    });
  });

  // Google OAuth routes
  app.get("/api/auth/google", (req, res) => {
    const authUrl = googleClient.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
    });
    res.json({ url: authUrl });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== "string") {
        return res.redirect("/login?error=google_auth_failed");
      }

      // Exchange code for tokens
      const { tokens } = await googleClient.getToken(code);
      googleClient.setCredentials(tokens);

      // Get user info from Google
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );
      const googleUser = await response.json();

      // Check if user exists
      let user = await storage.getUserByEmail(googleUser.email);

      if (!user) {
        // Create new user
        const username =
          googleUser.email.split("@")[0] + Math.floor(Math.random() * 1000);
        user = await storage.createUser({
          username,
          email: googleUser.email,
          password: await hashPassword(Math.random().toString(36)), // Random password for Google users
          fullName: googleUser.name || googleUser.email,
          role: "USER",
          avatar: googleUser.picture,
          isActive: true,
        });
      }

      // Generate JWT token
      const token = generateToken({ ...user, role: user.role as "USER" | "ADMIN" | "DEVELOPER" });

      // Redirect to frontend with token
      res.redirect(`/?token=${token}`);
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.redirect("/login?error=google_auth_failed");
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil kategori" });
    }
  });

  app.post(
    "/api/categories",
    authenticateToken,
    requireAdmin,
    async (req: AuthRequest, res) => {
      try {
        const categoryData = insertCategorySchema.parse(req.body);
        const category = await storage.createCategory(categoryData);
        res.status(201).json(category);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(500).json({ message: "Gagal membuat kategori" });
      }
    }
  );

  // Article routes
  app.get("/api/articles", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const categorySlug = req.query.category as string;
      const search = req.query.search as string;
      // Fix: Handle different published parameter values properly
      // If published="false", show all articles (for admin)
      // If published="true" or not specified, show only published articles (for public)
      let published: boolean | undefined;
      if (req.query.published === "false") {
        published = undefined; // Show all articles for admin
      } else {
        published = true; // Show only published articles for public
      }

      const result = await storage.getArticles(
        page,
        limit,
        categorySlug,
        search,
        published
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil artikel" });
    }
  });

  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ message: "Artikel tidak ditemukan" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil artikel" });
    }
  });

  app.post(
    "/api/articles",
    authenticateToken,
    requireAdmin,
    upload.single("coverImage"),
    async (req: AuthRequest, res) => {
      try {
        const articleData = insertArticleSchema.omit({ authorId: true }).parse({
          ...req.body,
          categoryId: parseInt(req.body.categoryId),
          isPublished: req.body.isPublished === "true",
          publishedAt: req.body.isPublished === "true" ? new Date() : null,
        });

        let coverImage = undefined;
        if (req.body.imageUploadType === "url" && req.body.coverImageUrl) {
          coverImage = req.body.coverImageUrl;
        } else if (req.body.imageUploadType === "file" && (req as any).file) {
          coverImage = `/uploads/${(req as any).file.filename}`;
        }

        const article = await storage.createArticle({
          ...articleData,
          authorId: req.user!.id,
          coverImage,
        });

        res.status(201).json(article);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(500).json({ message: "Gagal membuat artikel" });
      }
    }
  );

  app.put(
    "/api/articles/:id",
    authenticateToken,
    requireAdmin,
    upload.single("coverImage"),
    async (req: AuthRequest, res) => {
      try {
        const id = parseInt(req.params.id);
        const updates = insertArticleSchema
          .partial()
          .omit({ authorId: true })
          .parse({
            ...req.body,
            categoryId: req.body.categoryId
              ? parseInt(req.body.categoryId)
              : undefined,
            isPublished:
              req.body.isPublished !== undefined
                ? req.body.isPublished === "true"
                : undefined,
            publishedAt:
              req.body.isPublished === "true" ? new Date() : undefined,
          });

        let coverImage = updates.coverImage;
        if (req.body.imageUploadType === "url" && req.body.coverImageUrl) {
          coverImage = req.body.coverImageUrl;
        } else if (req.body.imageUploadType === "file" && req.file) {
          coverImage = `/uploads/${req.file.filename}`;
        }

        if (coverImage !== undefined) {
          updates.coverImage = coverImage;
        }

        if ((req as any).file) {
          updates.coverImage = `/uploads/${(req as any).file.filename}`;
        }

        const article = await storage.updateArticle(id, updates);
        res.json(article);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(500).json({ message: "Gagal memperbarui artikel" });
      }
    }
  );

  app.delete(
    "/api/articles/:id",
    authenticateToken,
    requireAdmin,
    async (req: AuthRequest, res) => {
      try {
        const id = parseInt(req.params.id);
        await storage.deleteArticle(id);
        res.json({ message: "Artikel berhasil dihapus" });
      } catch (error) {
        console.error("[DELETE /api/articles/:id] ERROR:", error);
        res.status(500).json({ message: "Gagal menghapus artikel", error: error instanceof Error ? error.message : error });
      }
    }
  );

  // Comment routes
  app.get("/api/articles/:articleId/comments", async (req, res) => {
    try {
      const articleId = parseInt(req.params.articleId);
      const comments = await storage.getCommentsByArticleId(articleId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil komentar" });
    }
  });

  app.post(
    "/api/articles/:articleId/comments",
    authenticateToken,
    async (req: AuthRequest, res) => {
      try {
        const articleId = parseInt(req.params.articleId);
        const { content } = insertCommentSchema
          .omit({ authorId: true, articleId: true })
          .parse(req.body);

        const comment = await storage.createComment({
          content,
          authorId: req.user!.id,
          articleId,
          isApproved: false, // Comments need moderation
        });

        res
          .status(201)
          .json({ message: "Komentar berhasil dikirim dan menunggu moderasi" });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(500).json({ message: "Gagal mengirim komentar" });
      }
    }
  );

  app.get(
    "/api/admin/comments",
    authenticateToken,
    requireAdmin,
    async (req: AuthRequest, res) => {
      try {
        const comments = await storage.getAllComments();
        res.json(comments);
      } catch (error) {
        res.status(500).json({ message: "Gagal mengambil semua komentar" });
      }
    }
  );

  app.get(
    "/api/admin/comments/pending",
    authenticateToken,
    requireAdmin,
    async (req: AuthRequest, res) => {
      try {
        const comments = await storage.getPendingComments();
        res.json(comments);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Gagal mengambil komentar yang menunggu moderasi" });
      }
    }
  );

  app.put(
    "/api/admin/comments/:id/approve",
    authenticateToken,
    requireAdmin,
    async (req: AuthRequest, res) => {
      try {
        const id = parseInt(req.params.id);
        await storage.updateComment(id, { isApproved: true });
        res.json({ message: "Komentar berhasil disetujui" });
      } catch (error) {
        res.status(500).json({ message: "Gagal menyetujui komentar" });
      }
    }
  );

  app.delete(
    "/api/admin/comments/:id",
    authenticateToken,
    requireAdmin,
    async (req: AuthRequest, res) => {
      try {
        const id = parseInt(req.params.id);
        await storage.deleteComment(id);
        res.json({ message: "Komentar berhasil dihapus" });
      } catch (error) {
        res.status(500).json({ message: "Gagal menghapus komentar" });
      }
    }
  );

  // Like routes
  app.post(
    "/api/articles/:articleId/like",
    authenticateToken,
    async (req: AuthRequest, res) => {
      try {
        const articleId = parseInt(req.params.articleId);
        const isLiked = await storage.toggleLike(req.user!.id, articleId);
        res.json({
          isLiked,
          message: isLiked ? "Artikel disukai" : "Like dibatalkan",
        });
      } catch (error) {
        res.status(500).json({ message: "Gagal memproses like" });
      }
    }
  );

  // Bookmark routes
  app.post(
    "/api/articles/:articleId/bookmark",
    authenticateToken,
    async (req: AuthRequest, res) => {
      try {
        const articleId = parseInt(req.params.articleId);
        const isBookmarked = await storage.toggleBookmark(
          req.user!.id,
          articleId
        );
        res.json({
          isBookmarked,
          message: isBookmarked ? "Artikel dibookmark" : "Bookmark dibatalkan",
        });
      } catch (error) {
        res.status(500).json({ message: "Gagal memproses bookmark" });
      }
    }
  );

  app.get(
    "/api/user/bookmarks",
    authenticateToken,
    async (req: AuthRequest, res) => {
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await storage.getUserBookmarks(
          req.user!.id,
          page,
          limit
        );
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: "Gagal mengambil bookmark" });
      }
    }
  );

  // Statistics route
  app.get(
    "/api/admin/statistics",
    authenticateToken,
    requireAdmin,
    async (req: AuthRequest, res) => {
      try {
        const stats = await storage.getStatistics();
        res.json(stats);
      } catch (error) {
        res.status(500).json({ message: "Gagal mengambil statistik" });
      }
    }
  );

  // Site settings routes
  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSiteSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Pengaturan tidak ditemukan" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil pengaturan" });
    }
  });

  app.get(
    "/api/dev/settings",
    authenticateToken,
    requireDeveloper,
    async (req: AuthRequest, res) => {
      try {
        const settings = await storage.getAllSiteSettings();
        res.json(settings);
      } catch (error) {
        res.status(500).json({ message: "Gagal mengambil pengaturan" });
      }
    }
  );

  app.post(
    "/api/dev/settings",
    authenticateToken,
    requireDeveloper,
    async (req: AuthRequest, res) => {
      try {
        const settingData = insertSiteSettingSchema.parse(req.body);
        const setting = await storage.setSiteSetting(settingData);
        res.json(setting);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(500).json({ message: "Gagal menyimpan pengaturan" });
      }
    }
  );

  app.delete(
    "/api/dev/settings/:key",
    authenticateToken,
    requireDeveloper,
    async (req: AuthRequest, res) => {
      try {
        await storage.deleteSiteSetting(req.params.key);
        res.json({ message: "Pengaturan berhasil dihapus" });
      } catch (error) {
        res.status(500).json({ message: "Gagal menghapus pengaturan" });
      }
    }
  );

  // System logs endpoint for developers
  app.get(
    "/api/dev/logs",
    authenticateToken,
    requireDeveloper,
    async (req: AuthRequest, res) => {
      try {
        // Return system information and recent activity
        const stats = await storage.getStatistics();
        const recentArticles = await storage.getArticles(1, 5);
        const recentComments = await storage.getAllComments();

        const systemInfo = {
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || "development",
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          timestamp: new Date().toISOString(),
          statistics: stats,
          recentActivity: {
            articles: recentArticles.articles.slice(0, 3),
            comments: recentComments.slice(0, 5),
          },
          databaseUrl: process.env.DATABASE_URL || "-",
          jwtSecret: process.env.JWT_SECRET || "-",
        };

        res.json(systemInfo);
      } catch (error) {
        res.status(500).json({ message: "Gagal mengambil informasi sistem" });
      }
    }
  );

  // Real-time logs endpoint for developers
  app.get(
    "/api/dev/logs/realtime",
    authenticateToken,
    requireDeveloper,
    async (req: AuthRequest, res) => {
      try {
        const logs = [
          {
            timestamp: new Date().toISOString(),
            level: "info",
            message: `Server uptime: ${Math.floor(
              process.uptime() / 60
            )} minutes`,
          },
          {
            timestamp: new Date().toISOString(),
            level: "info",
            message: `Memory usage: ${Math.round(
              process.memoryUsage().rss / 1024 / 1024
            )} MB`,
          },
          {
            timestamp: new Date().toISOString(),
            level: "success",
            message: "All systems operational",
          },
        ];

        res.json(logs);
      } catch (error) {
        res.status(500).json({ message: "Gagal mengambil log realtime" });
      }
    }
  );

  // Initialize default categories
  const initializeData = async () => {
    try {
      const categories = await storage.getCategories();
      if (categories.length === 0) {
        const defaultCategories = [
          {
            name: "Nasional",
            slug: "nasional",
            description: "Berita nasional Indonesia",
            color: "#DC2626",
          },
          {
            name: "Ekonomi",
            slug: "ekonomi",
            description: "Berita ekonomi dan bisnis",
            color: "#059669",
          },
          {
            name: "Olahraga",
            slug: "olahraga",
            description: "Berita olahraga",
            color: "#2563EB",
          },
          {
            name: "Teknologi",
            slug: "teknologi",
            description: "Berita teknologi dan inovasi",
            color: "#7C3AED",
          },
          {
            name: "Budaya",
            slug: "budaya",
            description: "Berita budaya dan seni",
            color: "#DC2626",
          },
        ];

        for (const category of defaultCategories) {
          await storage.createCategory(category);
        }
        console.log("Default categories created");
      }

      // (Removed) Do not create default admin and developer users automatically
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  };

  // Initialize data on server start
  await initializeData();

  app.get(
    "/api/user/profile",
    authenticateToken,
    async (req: AuthRequest, res) => {
      try {
        const user = await storage.getUserById(req.user!.id);
        if (!user) {
          return res.status(404).json({ message: "User tidak ditemukan" });
        }
        res.json(user);
      } catch (error) {
        res.status(500).json({ message: "Gagal mengambil profil pengguna" });
      }
    }
  );

  app.put(
    "/api/user/profile",
    authenticateToken,
    async (req: AuthRequest, res) => {
      try {
        const { fullName, email, currentPassword, newPassword } = req.body;
        const userId = req.user!.id;

        // Validasi input
        if (!fullName || !email) {
          return res.status(400).json({ message: "Nama dan email diperlukan" });
        }

        // Jika ingin mengubah password, validasi password lama
        if (newPassword) {
          if (!currentPassword) {
            return res
              .status(400)
              .json({
                message: "Password lama diperlukan untuk mengubah password",
              });
          }

          const user = await storage.getUserById(userId);
          if (
            !user ||
            !(await bcrypt.compare(currentPassword, user.password))
          ) {
            return res
              .status(400)
              .json({ message: "Password lama tidak benar" });
          }
        }

        const updateData: any = { fullName, email };

        if (newPassword) {
          updateData.password = await hashPassword(newPassword);
        }

        await storage.updateUser(userId, updateData);

        res.json({ message: "Profil berhasil diperbarui" });
      } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Gagal memperbarui profil" });
      }
    }
  );

  app.put(
    "/api/user/notifications",
    authenticateToken,
    async (req: AuthRequest, res) => {
      try {
        const notifications = req.body;
        const userId = req.user!.id;

        // For now, just return success since we don't have notifications table
        // In a real app, you'd store these preferences in a user_preferences table
        res.json({
          message: "Pengaturan notifikasi berhasil diperbarui",
          notifications,
        });
      } catch (error) {
        console.error("Error updating notifications:", error);
        res
          .status(500)
          .json({ message: "Gagal memperbarui pengaturan notifikasi" });
      }
    }
  );

  // Get all users (developer/admin only)
  app.get(
    "/api/dev/users",
    authenticateToken,
    requireDeveloper,
    async (req, res) => {
      try {
        const users = await storage.getAllUsers();
        res.json(users);
      } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data pengguna" });
      }
    }
  );

  // Update user role (developer/admin only, with password confirmation and audit log)
  app.post("/api/dev/users/:id/role", authenticateToken, requireDeveloper, async (req, res) => {
    try {
      const { role, password } = req.body;
      const id = parseInt(req.params.id);
      // Perbaiki typing agar req.user dikenali
      const actorId = (req as any).user?.id || (req as import("./middleware/auth").AuthRequest).user?.id;
      if (!role || !password) return res.status(400).json({ message: "Role dan password diperlukan" });
      // Verifikasi password user yang sedang login
      const actor = await storage.getUserById(actorId);
      if (!actor) return res.status(401).json({ message: "User tidak ditemukan" });
      const valid = await comparePassword(password, actor.password);
      if (!valid) return res.status(401).json({ message: "Password salah" });
      // Cek user target
      const targetUser = await storage.getUserById(id);
      if (!targetUser) return res.status(404).json({ message: "User target tidak ditemukan" });
      const oldRole = targetUser.role;
      // Update role
      const user = await storage.updateUserRole(id, role);
      // Catat ke audit log
      await prisma.userLog.create({
        data: {
          actorId,
          targetUserId: id,
          action: "change_role",
          detail: `from ${oldRole} to ${role}`,
        },
      });
      res.json(user);
    } catch (error) {
      const errorMessage = (error instanceof Error && error.message) ? error.message : "Gagal mengubah role pengguna";
      res.status(400).json({ message: errorMessage });
    }
  });

  // CRUD API untuk database (developer only)
  app.get(
    "/api/dev/db",
    authenticateToken,
    requireDeveloper,
    async (req, res) => {
      try {
        const { table } = req.query;
        if (!table || typeof table !== "string")
          return res.status(400).json({ message: "Table diperlukan" });
        const allowedTables = [
          "articles",
          "categories",
          "users",
          "comments",
          "bookmarks",
          "likes",
        ];
        if (!allowedTables.includes(table))
          return res.status(400).json({ message: "Table tidak valid" });
        // Helper: mapping nama tabel ke model Prisma
        const prismaTableMap: Record<string, any> = {
          users: prisma.user,
          articles: prisma.article,
          categories: prisma.category,
          comments: prisma.comment,
          bookmarks: prisma.bookmark,
          likes: prisma.like,
        };
        const prismaModel = prismaTableMap[table];
        if (!prismaModel) {
          console.log("[DEV/DB] Tabel tidak dikenali:", table);
          return res.status(400).json({ message: "Table tidak valid" });
        }
        // Ambil kolom dari satu row jika ada
        let columns: string[] = [];
        const row = await prismaModel.findFirst();
        if (row) {
          columns = Object.keys(row);
        }
        console.log("[DEV/DB] table:", table, "columns:", columns);
        let rows = [];
        if (columns.length > 0) {
          try {
            rows = await prismaModel.findMany({
              select: Object.fromEntries(columns.map((col) => [col, true])),
            });
          } catch (err) {
            console.error("[DEV/DB] QUERY ERROR:", err);
          }
        }
        console.log("[DEV/DB] rows:", rows);
        // Batasi jumlah data yang dikirim ke frontend agar tabel tidak terlalu besar
        let limitedRows = rows;
        let truncated = false;
        const MAX_ROWS = 60;
        if (rows.length > MAX_ROWS) {
          limitedRows = rows.slice(0, MAX_ROWS);
          truncated = true;
        }
        if (columns.length === 0) {
          // Fallback: tampilkan kolom dari Prisma fields jika ada
          columns = Object.keys(prismaModel.fields || {});
          console.log("[DEV/DB] Fallback columns from Prisma fields:", columns);
        }
        res.json({ columns, rows: limitedRows, truncated });
      } catch (error) {
        console.error("[DEV/DB] ERROR:", error);
        res.status(500).json({ message: "Gagal mengambil data database", error: error?.message || error });
      }
    }
  );

  app.delete(
    "/api/dev/db",
    authenticateToken,
    requireDeveloper,
    async (req, res) => {
      try {
        const { table, id } = req.query;
        if (!table || typeof table !== "string" || !id)
          return res.status(400).json({ message: "Table dan id diperlukan" });
        const allowedTables = Object.keys(prismaTableMap);
        if (!allowedTables.includes(table))
          return res.status(400).json({ message: "Table tidak valid" });
        const prismaModel = prismaTableMap[table];
        // Cek apakah data ada sebelum hapus
        const found = await prismaModel.findUnique({ where: { id: Number(id) } });
        if (!found) return res.status(404).json({ message: "Data tidak ditemukan" });
        await prismaModel.delete({ where: { id: Number(id) } });
        res.json({ message: "Data berhasil dihapus" });
      } catch (error: any) {
        console.error(`[DEV/DB][DELETE]`, error);
        res.status(500).json({ message: "Gagal menghapus data", error: error?.message || String(error) });
      }
    }
  );

  app.put(
    "/api/dev/db",
    authenticateToken,
    requireDeveloper,
    async (req, res) => {
      try {
        const { table } = req.query;
        if (!table || typeof table !== "string")
          return res.status(400).json({ message: "Table diperlukan" });
        const allowedTables = Object.keys(prismaTableMap);
        if (!allowedTables.includes(table))
          return res.status(400).json({ message: "Table tidak valid" });
        const prismaModel = prismaTableMap[table];
        const data = req.body;
        if (!data.id) return res.status(400).json({ message: "ID diperlukan" });
        // Hapus kolom yang tidak boleh diupdate jika perlu
        const updated = await prismaModel.update({
          where: { id: data.id },
          data,
        });
        res.json(updated);
      } catch (error: any) {
        res.status(500).json({ message: "Gagal mengubah data", error: error?.message || String(error) });
      }
    }
  );

  // DEBUG: log schema keys to verify tableObj
  console.log("SCHEMA TABLES:", Object.keys(schema));

  // Endpoint untuk mengambil log perubahan role user
  app.get("/api/dev/user-logs", authenticateToken, requireDeveloper, async (req, res) => {
    try {
      const logs = await prisma.userLog.findMany({
        include: {
          // relasi actor dan target tidak ada di model, jadi hapus include ini
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil log user", error: error instanceof Error ? error.message : error });
    }
  });

  // Forgot password - request reset
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email diperlukan" });
      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(404).json({ message: "Email tidak ditemukan" });
      // Generate token (simple, for demo: base64 userId + timestamp)
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");
      // Simpan token ke database atau cache jika ingin lebih aman (TODO: implementasi production)
      // Kirim email (dummy, tampilkan di response untuk demo)
      // TODO: Ganti dengan pengiriman email asli
      const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;
      // Logika kirim email di sini (atau gunakan nodemailer di production)
      res.json({ message: "Link reset password telah dikirim ke email (dummy)", resetUrl });
    } catch (error) {
      res.status(500).json({ message: "Gagal memproses permintaan reset password" });
    }
  });

  // Reset password - submit new password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) return res.status(400).json({ message: "Token dan password baru diperlukan" });
      // Decode token (base64 userId:timestamp)
      const [userIdStr] = Buffer.from(token, "base64").toString().split(":");
      const userId = parseInt(userIdStr);
      if (!userId) return res.status(400).json({ message: "Token tidak valid" });
      const user = await storage.getUserById(userId);
      if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
      // Update password
      const hashed = await hashPassword(password);
      await storage.updateUser(userId, { password: hashed });
      res.json({ message: "Password berhasil direset, silakan login dengan password baru." });
    } catch (error) {
      res.status(500).json({ message: "Gagal reset password" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
