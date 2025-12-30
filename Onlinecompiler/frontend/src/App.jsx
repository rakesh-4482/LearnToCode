import React from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Questions
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import CreateQuestion from "./pages/CreateQuestions";
import ShowQuestion from "./pages/ShowQuestion";
import EditQuestion from "./pages/EditQuestion";
import DeleteQuestion from "./pages/DeleteQuestion";
import ProblemPage from "./pages/ProblemPage";
import HintsPage from "./pages/HintsPage";

// Auth / User
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ChangePassword from "./pages/ChangePassword";
import UserStats from "./pages/UserStats";
import Leaderboard from "./pages/Leaderboard";
import PerformanceDashboard from "./pages/PerformanceDashboard";
import DeleteAccount from "./pages/DeleteAccount";
import Logout from "./pages/Logout";
import Layout from "./components/Layout";

// Blogs
import Blogs from "./pages/Blogs";
import CreateBlog from "./pages/CreateBlog";
import EditBlog from "./pages/EditBlog";
import BlogDetail from "./components/BlogDetail";

// Doubts
import Doubts from "./pages/doubts/Doubts";
import CreateDoubt from "./pages/doubts/CreateDoubt";
import DoubtDetail from "./pages/doubts/DoubtDetail";
import EditDoubt from "./pages/doubts/EditDoubt";
import Compiler from "./pages/Compiler";
import AskByteSmith from "./pages/AskByteSmith";

// Protected Route Component
const ProtectedRoute = ({ children, requireAuth = true }) => {
    const { currentUser, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    console.log('[ProtectedRoute] Render:', {
        path: location.pathname,
        requireAuth,
        isAuthenticated: !!currentUser,
        loading,
        currentUser: currentUser ? { id: currentUser.id, email: currentUser.email } : null
    });

    React.useEffect(() => {
        console.log('[ProtectedRoute] Auth state changed:', {
            loading,
            isAuthenticated: !!currentUser,
            currentPath: location.pathname
        });

        if (!loading && requireAuth && !currentUser) {
            console.log('[ProtectedRoute] Redirecting to login, was trying to access:', location.pathname);
            navigate('/login', { 
                state: { from: location },
                replace: true 
            });
        }
    }, [currentUser, loading, requireAuth, navigate, location]);

    if (loading) {
        console.log('[ProtectedRoute] Loading auth state...');
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (requireAuth && !currentUser) {
        console.log('[ProtectedRoute] Not authenticated, showing nothing (will redirect)');
        return null;
    }

    console.log('[ProtectedRoute] Rendering protected content for:', location.pathname);
    return children;
};

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={5000} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          
          {/* Public Routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="problems" element={<Problems />} />
          <Route path="problem/:slug" element={<ProblemPage />} />
          <Route path="problem/:slug/hints" element={<HintsPage />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="blogs/:id" element={<BlogDetail />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="compiler" element={<Compiler />} />
          <Route path="ask" element={<AskByteSmith />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<EditProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="stats" element={<UserStats />} />
            <Route path="performance" element={<PerformanceDashboard />} />
            <Route path="delete-account" element={<DeleteAccount />} />
            <Route path="logout" element={<Logout />} />
            <Route path="create-question" element={<CreateQuestion />} />
            <Route path="questions/:id/edit" element={<EditQuestion />} />
            <Route path="questions/:id/delete" element={<DeleteQuestion />} />
            <Route path="create-blog" element={<CreateBlog />} />
            <Route path="blogs/:id/edit" element={<EditBlog />} />
            <Route path="doubts" element={<Doubts />} />
            <Route path="doubts/create" element={<CreateDoubt />} />
            <Route path="doubts/:id" element={<DoubtDetail />} />
            <Route path="doubts/:id/edit" element={<EditDoubt />} />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600">Page not found</p>
              </div>
            </div>
          } />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
