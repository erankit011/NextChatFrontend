import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Login } from "../pages/Login";
import { Signup } from "../pages/Signup";
import { ForgotPassword } from "../pages/ForgotPassword";
import { ResetPassword } from "../pages/ResetPassword";
import { Home } from "../pages/Home";
import { Profile } from "../pages/Profile";
import { Chat } from "../pages/Chat";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Public Route Component (redirect to home if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/home" replace /> : children;
}

const App = () => {
  return (
    <Routes>
      {/* Public Routes - redirect to /home if already logged in */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } 
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected Routes */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
