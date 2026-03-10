import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../utils/cn';

export default function SignupPage() {
    const [role, setRole] = useState('nri'); // 'nri' or 'companion'
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        country: '', // Only for NRI
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { signupNri, signupCompanion } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (role === 'nri') {
                await signupNri({
                    full_name: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    country: formData.country
                });
            } else {
                await signupCompanion({
                    full_name: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone
                });
            }
            // Show success message and redirect after 4 seconds
            if (role === 'companion') {
                setSuccess('Registration completed! Waiting for admin approval. Redirecting to login...');
            } else {
                setSuccess('Account created successfully! Redirecting to login...');
            }
            setTimeout(() => {
                navigate('/login');
            }, 4000);
        } catch (err) {
            console.error("Signup error:", err);
            const detail = err.response?.data?.detail;
            const errorMessage = typeof detail === 'string'
                ? detail
                : (detail && typeof detail === 'object')
                    ? JSON.stringify(detail)
                    : 'Failed to create account. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    return (
        <div className="flex min-h-screen bg-white">
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-32 bg-white lg:w-1/2">
                <div className="mx-auto w-full max-w-sm lg:w-[420px]">
                    <div>
                        <Link to="/" className="text-3xl font-bold tracking-tighter text-primary">CareUp</Link>
                        <h2 className="mt-8 text-4xl font-bold tracking-tight text-primary">Create your account</h2>
                        <p className="mt-3 text-lg text-muted">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-accent hover:text-accent/80 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <div className="mt-10">
                        {/* Role Selection Tabs */}
                        <div className="mb-8 grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1.5">
                            <button
                                type="button"
                                onClick={() => setRole('nri')}
                                className={cn(
                                    "rounded-xl py-3 text-sm font-semibold transition-all duration-200",
                                    role === 'nri'
                                        ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                                        : "text-muted hover:text-primary hover:bg-white/50"
                                )}
                            >
                                I need care (NRI)
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('companion')}
                                className={cn(
                                    "rounded-xl py-3 text-sm font-semibold transition-all duration-200",
                                    role === 'companion'
                                        ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                                        : "text-muted hover:text-primary hover:bg-white/50"
                                )}
                            >
                                I am a Companion
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
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

                            <div>
                                <label htmlFor="fullName" className="block text-sm font-semibold text-primary mb-1.5">Full Name</label>
                                <Input id="fullName" value={formData.fullName} onChange={handleChange} required className="bg-gray-50/50" />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-primary mb-1.5">Email address</label>
                                <Input id="email" type="email" value={formData.email} onChange={handleChange} required className="bg-gray-50/50" />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-primary mb-1.5">Password</label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
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

                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-primary mb-1.5">Phone Number</label>
                                <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} required className="bg-gray-50/50" />
                            </div>

                            {role === 'nri' && (
                                <div>
                                    <label htmlFor="country" className="block text-sm font-semibold text-primary mb-1.5">Current Country</label>
                                    <Input id="country" value={formData.country} onChange={handleChange} required className="bg-gray-50/50" placeholder="e.g. UAE, UK, USA" />
                                </div>
                            )}

                            <div className="pt-2">
                                <Button type="submit" size="lg" className="w-full text-base" disabled={loading}>
                                    {loading ? 'Creating account...' : 'Create account'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div className="relative hidden w-0 flex-1 lg:block">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2568&auto=format&fit=crop')" }}>
                    <div className="absolute inset-0 bg-accent/90 mix-blend-multiply" />
                    <div className="absolute inset-0 flex items-center justify-center p-20 text-center">
                        <div className="max-w-lg text-white">
                            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-3xl text-white">
                                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            </div>
                            <h2 className="text-5xl font-bold mb-6 tracking-tight">Join the Family</h2>
                            <p className="text-xl text-white/90 leading-relaxed font-light">
                                {role === 'nri'
                                    ? "Distance shouldn't mean compromise. Ensure your parents get the best care."
                                    : "Turn your compassion into a career. Join our network of trusted companions."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
