import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ArticleDetail from "@/pages/ArticleDetail";
import Bookmarks from "@/pages/Bookmarks";
import Settings from "./pages/Settings";
import AdminDashboard from "@/pages/admin/Dashboard";
import ArticleManagement from "@/pages/admin/ArticleManagement";
import CommentModeration from "@/pages/admin/CommentModeration";
import DeveloperSettings from "@/pages/developer/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/article/:slug" component={ArticleDetail} />
        <Route path="/bookmarks" component={Bookmarks} />
        <Route path="/settings" component={Settings} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/articles" component={ArticleManagement} />
        <Route path="/admin/comments" component={CommentModeration} />
        <Route path="/dev" component={DeveloperSettings} />
        <Route component={NotFound} />
      </Switch>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-indonesia-red rounded-lg flex items-center justify-center">
                  <i className="fas fa-newspaper text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Semua Tentang Indonesia</h3>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Portal berita terpercaya yang menyajikan informasi terkini tentang Indonesia dari berbagai sudut pandang.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Kategori</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/?category=nasional" className="hover:text-white transition-colors">Nasional</a></li>
                <li><a href="/?category=ekonomi" className="hover:text-white transition-colors">Ekonomi</a></li>
                <li><a href="/?category=olahraga" className="hover:text-white transition-colors">Olahraga</a></li>
                <li><a href="/?category=teknologi" className="hover:text-white transition-colors">Teknologi</a></li>
                <li><a href="/?category=budaya" className="hover:text-white transition-colors">Budaya</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tim Redaksi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Karir</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontak</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Hubungi Kami</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Email: redaksi@semuatentangindonesia.com</p>
                <p>Telepon: +62 21 1234 5678</p>
                <p>Jakarta, Indonesia</p>
              </div>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-facebook text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-youtube text-xl"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Semua Tentang Indonesia. Hak cipta dilindungi undang-undang.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;