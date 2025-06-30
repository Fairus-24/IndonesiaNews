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
import CategoryPage from "@/pages/Category";
import Settings from "./pages/Settings";
import AdminDashboard from "@/pages/admin/Dashboard";
import ArticleManagement from "@/pages/admin/ArticleManagement";
import CommentModeration from "@/pages/admin/CommentModeration";
import DeveloperSettings from "@/pages/developer/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/article/:slug" component={ArticleDetail} />
          <Route path="/bookmarks" component={Bookmarks} />
          <Route path="/category/:categorySlug">
            {(params) => <CategoryPage categorySlug={params.categorySlug} />}
          </Route>
          <Route path="/settings" component={Settings} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/articles" component={ArticleManagement} />
          <Route path="/admin/comments" component={CommentModeration} />
          <Route path="/dev" component={DeveloperSettings} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </AuthProvider>
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