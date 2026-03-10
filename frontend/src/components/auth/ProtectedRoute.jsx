import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on actual role if trying to access unauthorized route
        if (user.role === 'admin') return <Navigate to="/dashboard/admin" replace />;
        if (user.role === 'companion') return <Navigate to="/dashboard/companion" replace />;
        return <Navigate to="/dashboard/profile" replace />;
    }

    return children;
};

export default ProtectedRoute;
