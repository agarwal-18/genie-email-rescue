
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Places from "./pages/Places";
import Itinerary from "./pages/Itinerary";
import NotFound from "./pages/NotFound";
import SavedItineraries from "./pages/SavedItineraries";
import Forum from "./pages/Forum";
import ForumPostCreate from "./pages/ForumPostCreate";
import ForumPostDetail from "./pages/ForumPostDetail";
import UserProfile from "./pages/UserProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/places" element={<Places />} />
            <Route path="/itinerary" element={<ProtectedRoute><Itinerary /></ProtectedRoute>} />
            <Route path="/saved-itineraries" element={<ProtectedRoute><SavedItineraries /></ProtectedRoute>} />
            
            {/* Forum Routes */}
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/create" element={<ProtectedRoute><ForumPostCreate /></ProtectedRoute>} />
            <Route path="/forum/post/:postId" element={<ForumPostDetail />} />
            <Route path="/profile/:userId?" element={<UserProfile />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
