import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SiteSettingsProvider } from "./lib/siteSettings";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ArticleDetail from "@/pages/ArticleDetail";
import Bookmarks from "@/pages/Bookmarks";
import CategoryPage from "@/pages/Category";
import Settings from "./pages/Settings";
import AdminDashboard from "@/pages/admin/Dashboard";
import ArticleManagement from "@/pages/admin/ArticleManagement";
import CommentModeration from "@/pages/admin/CommentModeration";
import DeveloperSettings from "@/pages/developer/Settings";
import NotFound from "@/pages/not-found";
import SearchPage from "@/pages/search";
import { useEffect } from "react";
import { useLocation } from "wouter";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);
  return null;
}

function Router() {
  return (
    <SiteSettingsProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <ScrollToTop />
          <div className="flex-1">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/article/:slug" component={ArticleDetail} />
              <Route path="/bookmarks" component={Bookmarks} />
              <Route path="/category/:categorySlug">
                {(params) => (
                  <CategoryPage categorySlug={params.categorySlug} />
                )}
              </Route>
              <Route path="/settings" component={Settings} />
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/articles" component={ArticleManagement} />
              <Route path="/admin/comments" component={CommentModeration} />
              <Route path="/dev" component={DeveloperSettings} />
              <Route path="/search" component={SearchPage} />
              <Route component={NotFound} />
            </Switch>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </SiteSettingsProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
