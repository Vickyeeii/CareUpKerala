import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Navbar } from '../../components/layout/Navbar';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await login(email, password);
            // Show success message and redirect after 1 second
            setSuccess('Login successful! Redirecting...');

            // Get user role from local storage or decode token (simplest is to use the response from login if possible, but context updates asynchronously)
            // Ideally login function returns user data. Let's assume login returns response.data
            // Actually, looking at context, login returns response.data.

            const userData = JSON.parse(localStorage.getItem('user'));
            const role = userData?.role;

            setTimeout(() => {
                if (role === 'admin') navigate('/dashboard/admin');
                else if (role === 'companion') navigate('/dashboard/companion');
                else navigate('/dashboard/profile');
            }, 1000);
        } catch (err) {
            console.error("Login error:", err);
            const detail = err.response?.data?.detail;
            const errorMessage = typeof detail === 'string'
                ? detail
                : (detail && typeof detail === 'object')
                    ? JSON.stringify(detail)
                    : 'Failed to login. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side - Form */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-32 bg-white lg:w-1/2">
                <div className="mx-auto w-full max-w-sm lg:w-[420px]">
                    <div className="mb-10">
                        <Link to="/" className="text-3xl font-bold tracking-tighter text-primary">CareUp</Link>
                        <h2 className="mt-8 text-4xl font-bold tracking-tight text-primary">Welcome back</h2>
                        <p className="mt-3 text-lg text-muted">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-semibold text-accent hover:text-accent/80 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="rounded-xl bg-green-50 p-4 text-sm font-medium text-green-600 animate-in fade-in slide-in-from-top-1">
                                {success}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-primary mb-1.5">
                                    Email address
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-gray-50/50"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-primary mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-gray-50/50 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted">
                                    Remember me
                                </label>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button type="submit" size="lg" className="w-full text-base" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Side - Image/Brand */}
            <div className="relative hidden w-0 flex-1 lg:block bg-gray-50">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2568&auto=format&fit=crop')" }}>
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-20 text-white">
                        <blockquote className="max-w-xl">
                            <p className="text-3xl font-medium leading-tight">"The peace of mind I have knowing my parents are cared for is priceless. CareUp is a lifesaver."</p>
                            <footer className="mt-6">
                                <div className="font-bold text-lg">Anjali Menon</div>
                                <div className="text-white/80">NRI working in Dubai</div>
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>
        </div>
    );
}
