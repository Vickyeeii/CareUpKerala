import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleDashboardClick = () => {
        if (user?.role === 'companion') {
            navigate('/dashboard/companion');
        } else if (user?.role === 'admin' || user?.role === 'superuser') {
            navigate('/dashboard/admin');
        } else {
            navigate('/dashboard/profile');
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full glass border-b-0">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link to="/" className="text-xl font-bold tracking-tight text-primary">
                        CareUp
                    </Link>

                    {/* Public Links */}
                    <div className="hidden md:flex items-center gap-6">
                        <a href="/#features" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                            Services
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Button variant="ghost" onClick={handleDashboardClick}>
                                Dashboard
                            </Button>
                            <Button variant="outline" onClick={logout} className="hidden sm:flex">
                                Log out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost">Log in</Button>
                            </Link>
                            <Link to="/signup">
                                <Button>Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
