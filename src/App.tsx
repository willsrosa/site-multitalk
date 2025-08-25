import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminPosts from './components/admin/AdminPosts';
import AdminPostForm from './components/admin/AdminPostForm';
import AdminUsers from './components/admin/AdminUsers';
import AdminLoginPage from './pages/AdminLoginPage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import { Toaster } from 'react-hot-toast';
import BlogPostPage from './pages/BlogPostPage';
import ScrollToTop from './components/ScrollToTop';
import AffiliatePage from './pages/AffiliatePage';
import KanbanBoard from './components/admin/kanban/KanbanBoard';
import ProfilePage from './components/admin/ProfilePage';
import SuperAdminRoute from './components/admin/SuperAdminRoute';

const PublicLayout = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
    <WhatsAppButton />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <ScrollToTop />
          <Toaster position="top-right" reverseOrder={false} />
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="posts" element={<AdminPosts />} />
                <Route path="kanban" element={<KanbanBoard />} />
                <Route path="perfil" element={<ProfilePage />} />
                
                {/* Superadmin only routes */}
                <Route element={<SuperAdminRoute />}>
                  <Route path="usuarios" element={<AdminUsers />} />
                  <Route path="posts/new" element={<AdminPostForm />} />
                  <Route path="posts/edit/:id" element={<AdminPostForm />} />
                </Route>
              </Route>
            </Route>

            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:slug" element={<BlogPostPage />} />
              <Route path="v/:slug" element={<AffiliatePage />} />
              {/* Redirect any other public path to home */}
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
