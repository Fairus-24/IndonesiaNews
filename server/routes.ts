import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, hashPassword, comparePassword, generateToken, requireAdmin, requireDeveloper, type AuthRequest } from "./middleware/auth";
import { upload } from "./services/upload";
import { insertUserSchema, insertArticleSchema, insertCommentSchema, insertCategorySchema, insertSiteSettingSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { OAuth2Client } from "google-auth-library";

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Terlalu banyak permintaan, coba lagi nanti",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: "Terlalu banyak percobaan login, coba lagi nanti",
});

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
  app.use(cors({
    origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "*",
    credentials: true,
  }));

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
      const { username, email, password, fullName } = insertUserSchema.extend({
        password: z.string().min(6, "Password minimal 6 karakter"),
        email: z.string().email("Format email tidak valid"),
      }).parse(req.body);

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email) || await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Email atau username sudah digunakan" });
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
      const token = generateToken(user);

      res.status(201).json({
        message: "Registrasi berhasil",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
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
      const { email, password } = z.object({
        email: z.string().email("Format email tidak valid"),
        password: z.string().min(1, "Password diperlukan"),
      }).parse(req.body);

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
      const token = generateToken(user);

      res.json({
        message: "Login berhasil",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
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
        role: req.user!.role,
        avatar: req.user!.avatar,
      },
    });
  });

  // Google OAuth routes
  app.get("/api/auth/google", (req, res) => {
    const authUrl = googleClient.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
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
      const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });
      const googleUser = await response.json();

      // Check if user exists
      let user = await storage.getUserByEmail(googleUser.email);
      
      if (!user) {
        // Create new user
        const username = googleUser.email.split("@")[0] + Math.floor(Math.random() * 1000);
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
      const token = generateToken(user);
      
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

  app.post("/api/categories", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
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
  });

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

      const result = await storage.getArticles(page, limit, categorySlug, search, published);
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

  app.post("/api/articles", authenticateToken, requireAdmin, upload.single("coverImage"), async (req: AuthRequest, res) => {
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
      } else if (req.body.imageUploadType === "file" && req.file) {
        coverImage = `/uploads/${req.file.filename}`;
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
  });

  app.put("/api/articles/:id", authenticateToken, requireAdmin, upload.single("coverImage"), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertArticleSchema.partial().omit({ authorId: true }).parse({
        ...req.body,
        categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : undefined,
        isPublished: req.body.isPublished !== undefined ? req.body.isPublished === "true" : undefined,
        publishedAt: req.body.isPublished === "true" ? new Date() : undefined,
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

      if (req.file) {
        updates.coverImage = `/uploads/${req.file.filename}`;
      }

      const article = await storage.updateArticle(id, updates);
      res.json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Gagal memperbarui artikel" });
    }
  });

  app.delete("/api/articles/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteArticle(id);
      res.json({ message: "Artikel berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ message: "Gagal menghapus artikel" });
    }
  });

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

  app.post("/api/articles/:articleId/comments", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const articleId = parseInt(req.params.articleId);
      const { content } = insertCommentSchema.omit({ authorId: true, articleId: true }).parse(req.body);

      const comment = await storage.createComment({
        content,
        authorId: req.user!.id,
        articleId,
        isApproved: false, // Comments need moderation
      });

      res.status(201).json({ message: "Komentar berhasil dikirim dan menunggu moderasi" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Gagal mengirim komentar" });
    }
  });

  app.get("/api/admin/comments/pending", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const comments = await storage.getPendingComments();
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil komentar yang menunggu moderasi" });
    }
  });

  app.put("/api/admin/comments/:id/approve", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.updateComment(id, { isApproved: true });
      res.json({ message: "Komentar berhasil disetujui" });
    } catch (error) {
      res.status(500).json({ message: "Gagal menyetujui komentar" });
    }
  });

  app.delete("/api/admin/comments/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteComment(id);
      res.json({ message: "Komentar berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ message: "Gagal menghapus komentar" });
    }
  });

  // Like routes
  app.post("/api/articles/:articleId/like", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const articleId = parseInt(req.params.articleId);
      const isLiked = await storage.toggleLike(req.user!.id, articleId);
      res.json({ isLiked, message: isLiked ? "Artikel disukai" : "Like dibatalkan" });
    } catch (error) {
      res.status(500).json({ message: "Gagal memproses like" });
    }
  });

  // Bookmark routes
  app.post("/api/articles/:articleId/bookmark", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const articleId = parseInt(req.params.articleId);
      const isBookmarked = await storage.toggleBookmark(req.user!.id, articleId);
      res.json({ isBookmarked, message: isBookmarked ? "Artikel dibookmark" : "Bookmark dibatalkan" });
    } catch (error) {
      res.status(500).json({ message: "Gagal memproses bookmark" });
    }
  });

  app.get("/api/user/bookmarks", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await storage.getUserBookmarks(req.user!.id, page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil bookmark" });
    }
  });

  // Statistics route
  app.get("/api/admin/statistics", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Gagal mengambil statistik" });
    }
  });

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

  app.post("/api/dev/settings", authenticateToken, requireDeveloper, async (req: AuthRequest, res) => {
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
  });

  // Initialize default categories
  const initializeData = async () => {
    try {
      const categories = await storage.getCategories();
      if (categories.length === 0) {
        const defaultCategories = [
          { name: "Nasional", slug: "nasional", description: "Berita nasional Indonesia", color: "#DC2626" },
          { name: "Ekonomi", slug: "ekonomi", description: "Berita ekonomi dan bisnis", color: "#059669" },
          { name: "Olahraga", slug: "olahraga", description: "Berita olahraga", color: "#2563EB" },
          { name: "Teknologi", slug: "teknologi", description: "Berita teknologi dan inovasi", color: "#7C3AED" },
          { name: "Budaya", slug: "budaya", description: "Berita budaya dan seni", color: "#DC2626" },
        ];

        for (const category of defaultCategories) {
          await storage.createCategory(category);
        }
        console.log("Default categories created");
      }

      // Create default admin user if none exists
      const adminUser = await storage.getUserByEmail("admin@example.com");
      if (!adminUser) {
        const hashedPassword = await hashPassword("admin123");
        await storage.createUser({
          username: "admin",
          email: "admin@example.com",
          password: hashedPassword,
          fullName: "Administrator",
          role: "ADMIN",
        });
        console.log("Default admin user created (admin@example.com / admin123)");
      }

      // Create default developer user if none exists
      const devUser = await storage.getUserByEmail("developer@example.com");
      if (!devUser) {
        const hashedPassword = await hashPassword("dev123");
        await storage.createUser({
          username: "developer",
          email: "developer@example.com",
          password: hashedPassword,
          fullName: "Developer",
          role: "DEVELOPER",
        });
        console.log("Default developer user created (developer@example.com / dev123)");
      }

    } catch (error) {
      console.error("Error initializing data:", error);
    }
  };

  // Initialize data on server start
  await initializeData();

  const httpServer = createServer(app);
  return httpServer;
}
