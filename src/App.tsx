import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Places from './pages/Places';
import Itinerary from './pages/Itinerary';
import SavedItineraries from './pages/SavedItineraries';
import Forum from './pages/Forum';
import ForumPostCreate from './pages/ForumPostCreate';
import ForumPostDetail from './pages/ForumPostDetail';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Toaster />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/places" element={<Places />} />
            <Route path="/itinerary" element={<ProtectedRoute><Itinerary /></ProtectedRoute>} />
            <Route path="/saved-itineraries" element={<ProtectedRoute><SavedItineraries /></ProtectedRoute>} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/create" element={<ProtectedRoute><ForumPostCreate /></ProtectedRoute>} />
            <Route path="/forum/post/:postId" element={<ForumPostDetail />} />
            <Route path="/profile/:userId?" element={<UserProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
