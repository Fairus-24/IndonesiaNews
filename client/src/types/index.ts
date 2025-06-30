export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: "USER" | "ADMIN" | "DEVELOPER";
  avatar?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
}

export interface Article {
  description: string;
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: User;
  category: Category;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    likes: number;
    comments: number;
    bookmarks: number;
  };
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  articleId: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Statistics {
  totalArticles: number;
  totalUsers: number;
  totalComments: number;
  totalLikes: number;
  totalBookmarks: number;
}
