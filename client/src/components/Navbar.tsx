import { useState, useEffect } from "react";
import { useSiteSettings } from "@/lib/siteSettings";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import {
  Newspaper,
  Search,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Bookmark,
  Wrench,
  BarChart3,
  Code,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export default function Navbar() {
  const siteSettings = useSiteSettings();
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);

  const isAdmin = () => user?.role === "ADMIN" || user?.role === "DEVELOPER";
  const isDeveloper = () => user?.role === "DEVELOPER";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setLocation("/");
    }
  };

  useEffect(() => {
    if (debouncedSearch.trim()) {
      setLocation(
        `/search?search=${encodeURIComponent(debouncedSearch.trim())}`
      );
    } else {
      setLocation("/");
    }
  }, [debouncedSearch]);

  // Sinkronkan searchQuery dengan parameter search di URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSearch = urlParams.get("search") || "";
    setSearchQuery(urlSearch);
  }, [location]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-indonesia-red rounded-lg flex items-center justify-center">
              {siteSettings.site_icon ? (
                <img
                  src={siteSettings.site_icon}
                  alt="icon"
                  className="w-8 h-8 rounded"
                />
              ) : (
                <Newspaper className="text-white text-xl" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {siteSettings.site_name || "Semua Tentang Indonesia"}
              </h1>
              <p className="text-xs text-gray-500">
                {siteSettings.site_description || "Portal Berita Terpercaya"}
              </p>
            </div>
          </Link>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:block relative">
              <Input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pr-10"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Search className="h-4 w-4 text-gray-400" />
              </button>
            </form>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/bookmarks">
                  <Button variant="ghost" size="sm" title="Bookmark Saya">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user?.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem disabled>
                      <User className="mr-2 h-4 w-4" />
                      <span>{user?.fullName}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    {isAdmin() && (
                      <Link href="/admin">
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>Dashboard Admin</span>
                        </DropdownMenuItem>
                      </Link>
                    )}

                    {isDeveloper() && (
                      <Link href="/dev">
                        <DropdownMenuItem>
                          <Code className="mr-2 h-4 w-4" />
                          <span>Developer Panel</span>
                        </DropdownMenuItem>
                      </Link>
                    )}

                    <Link href="/settings">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Pengaturan</span>
                      </DropdownMenuItem>
                    </Link>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Keluar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-indonesia-red hover:bg-indonesia-red/90"
                  >
                    Daftar
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      type="text"
                      placeholder="Cari berita..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <Search className="h-4 w-4 text-gray-400" />
                    </button>
                  </form>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
