import { useState, useEffect } from "react";
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
  Code
} from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const isAdmin = () => user?.role === "ADMIN" || user?.role === "DEVELOPER";
  const isDeveloper = () => user?.role === "DEVELOPER";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: "Beranda", href: "/", active: location === "/" },
    { name: "Nasional", href: "/?category=nasional", active: location.includes("category=nasional") },
    { name: "Ekonomi", href: "/?category=ekonomi", active: location.includes("category=ekonomi") },
    { name: "Olahraga", href: "/?category=olahraga", active: location.includes("category=olahraga") },
    { name: "Teknologi", href: "/?category=teknologi", active: location.includes("category=teknologi") },
    { name: "Budaya", href: "/?category=budaya", active: location.includes("category=budaya") },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-indonesia-red rounded-lg flex items-center justify-center">
              <Newspaper className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Semua Tentang Indonesia</h1>
              <p className="text-xs text-gray-500">Portal Berita Terpercaya</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {categories.map((category) => (
              <Link key={category.name} href={category.href}>
                <span className={`transition-colors pb-1 ${
                  category.active 
                    ? "text-indonesia-red font-medium border-b-2 border-indonesia-red" 
                    : "text-gray-600 hover:text-indonesia-red"
                }`}>
                  {category.name}
                </span>
              </Link>
            ))}
          </div>

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
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
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
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user?.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                  <Button size="sm" className="bg-indonesia-red hover:bg-indonesia-red/90">
                    Daftar
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
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
                    <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Search className="h-4 w-4 text-gray-400" />
                    </button>
                  </form>

                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Link key={category.name} href={category.href}>
                        <div className={`block px-3 py-2 rounded-lg transition-colors ${
                          category.active
                            ? "text-indonesia-red font-medium bg-red-50"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}>
                          {category.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}