import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesApi } from '../api/services';
import { BookingModal } from '../components/bookings/BookingModal';

export default function LandingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const data = await servicesApi.getAll();
            setServices(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBookNow = (service) => {
        setSelectedService(service);
        setIsBookingModalOpen(true);
    };

    useEffect(() => {
        if (user) {
            if (user.role === 'companion') {
                navigate('/dashboard/companion');
            } else if (user.role === 'admin' || user.role === 'superuser') {
                navigate('/dashboard/admin');
            } else {
                navigate('/dashboard/profile');
            }
        }
    }, [user, navigate]);
    return (
        <div className="flex min-h-screen flex-col bg-background font-sans selection:bg-accent/20">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
                {/* Background Decor */}
                {/* Dynamic Background Mesh */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-20 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] animate-pulse delay-1000"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="inline-flex items-center rounded-full border border-gray-200 bg-white/50 px-3 py-1 text-sm text-muted backdrop-blur-md mb-8 animate-fade-in-up">
                            <span className="flex h-2 w-2 rounded-full bg-accent mr-2 animate-pulse"></span>
                            Trusted by 500+ families in Kerala
                        </div>

                        <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-primary sm:text-7xl lg:text-8xl animate-fade-in-up delay-100">
                            Care that feels like <span className="text-accent italic relative inline-block">
                                family.
                                <svg className="absolute w-full h-3 -bottom-2 left-0 text-accent/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                                </svg>
                            </span>
                        </h1>

                        <p className="mt-8 max-w-xl text-xl text-muted leading-relaxed animate-fade-in-up delay-200">
                            Reliable, professional home care services. We bridge the gap between NRIs and their parents back home with transparency and love.
                        </p>

                        <div className="mt-10 flex flex-col gap-4 sm:flex-row items-center animate-fade-in-up delay-300">
                            <Link to="/signup">
                                <Button size="lg" className="h-14 px-8 text-lg shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-shadow">
                                    Get Started
                                </Button>
                            </Link>
                            <a href="#features" onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
                            }}>
                                <Button variant="secondary" size="lg" className="h-14 px-8 text-lg bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/80 transition-colors">
                                    Our Services
                                </Button>
                            </a>
                        </div>

                        {/* Hero visual */}
                        <div className="mt-20 w-full max-w-5xl animate-fade-in-up delay-500">
                            <div className="relative aspect-video overflow-hidden rounded-3xl bg-gray-100 shadow-2xl ring-1 ring-gray-900/5 transform hover:scale-[1.01] transition-transform duration-700">
                                <img
                                    src="https://plus.unsplash.com/premium_photo-1664301906677-f060e95aee16?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Indian mother and daughter embracing"
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-linear-to-tr from-black/20 to-transparent" />
                                {/* Floating glass card */}
                                <div className="absolute bottom-8 left-8 p-6 glass-card rounded-2xl max-w-xs hidden md:block">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                                            ✓
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary">Verified Companion</p>
                                            <p className="text-sm text-muted">Just checked in</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Bento Grid Style */}
            <section id="features" className="py-32 bg-white relative">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="mb-20 max-w-2xl">
                        <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-5xl">
                            Why families choose CareUp
                        </h2>
                        <p className="mt-6 text-xl text-muted">
                            A seamless experience designed for peace of mind, from anywhere in the world.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Dynamic Services Grid */}
                        {services.length > 0 ? (
                            services.filter(s => s.is_active).map((service) => (
                                <Card key={service.id} className="flex flex-col bg-white hover:shadow-lg transition-all duration-300">
                                    <CardContent className="flex flex-1 flex-col p-8">
                                        <div className="mb-6 h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                            {/* Generic Service Icon */}
                                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                        </div>
                                        <h3 className="mb-3 text-2xl font-bold text-primary">{service.name}</h3>
                                        <p className="text-muted text-lg leading-relaxed mb-6 flex-1">
                                            {service.description}
                                        </p>
                                        <div className="mt-auto">
                                            <div className="flex items-end justify-between mb-4">
                                                <div>
                                                    <span className="text-sm text-muted">Starting from</span>
                                                    <div className="text-xl font-bold text-primary">
                                                        {service.pricing && service.pricing.length > 0
                                                            ? `${service.pricing[0].currency} ${service.pricing[0].price}`
                                                            : 'Contact for price'}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                className="w-full"
                                                onClick={() => handleBookNow(service)}
                                            >
                                                Book Now
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            // Fallback static cards if no services loaded (or API error)
                            <>
                                {/* Feature 1 - Verified Companions */}
                                <Card className="flex flex-col bg-white hover:shadow-lg transition-all duration-300">
                                    <CardContent className="flex flex-1 flex-col p-8">
                                        <div className="mb-6 h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <h3 className="mb-3 text-2xl font-bold text-primary">Verified Companions</h3>
                                        <p className="text-muted text-lg leading-relaxed mb-6 flex-1">
                                            Every caregiver undergoes a rigorous 5-step background check, identity verification, and soft-skills training.
                                        </p>
                                    </CardContent>
                                </Card>
                                {/* Feature 2 - Real-time Updates */}
                                <Card className="flex flex-col bg-accent text-white hover:shadow-xl hover:shadow-accent/20 transition-all duration-300 transform md:-mt-4">
                                    <CardContent className="flex flex-1 flex-col p-8">
                                        <div className="mb-6 h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="mb-3 text-2xl font-bold text-white">Real-time Updates</h3>
                                            <p className="text-white/90 text-lg leading-relaxed">
                                                Stay in the loop with instant photo updates and logs delivered to your phone.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* Feature 3 - Transparent Pricing */}
                        <Card className="flex flex-col bg-white hover:shadow-lg transition-all duration-300">
                            <CardContent className="flex flex-1 flex-col p-8">
                                <div className="mb-6 h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center text-primary">
                                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="mb-3 text-2xl font-bold text-primary">Transparent Pricing</h3>
                                <p className="text-muted text-lg leading-relaxed mb-6 flex-1">
                                    No hidden subscriptions or surprise fees. Pay only for the services you use, with complete visibility into every transaction.
                                </p>
                                <div className="h-40 w-full rounded-2xl bg-gray-50 border border-gray-100/50 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-primary">₹0</div>
                                        <div className="text-sm text-muted">Booking fees</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Optional 4th Feature to balance the grid if user wants 2x2 on md, or 3-col. Here I am sticking to 3 main value props for cleanliness, OR I can add a dedicated manager card as a full-width bottom banner if requested. For now, 3 columns is cleaner and minimal. If I need 4, I'll do a 2x2. Let's make it 3 perfectly aligned cards. */}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-gray-50 relative overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                            How CareUp Works
                        </h2>
                        <p className="mt-4 text-lg text-muted">
                            Three simple steps to peace of mind.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>

                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="h-24 w-24 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-primary mb-8 relative z-10">
                                <span className="text-2xl font-bold">1</span>
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-3">Create Profile</h3>
                            <p className="text-muted leading-relaxed">
                                Sign up and tell us about your parents' needs and preferences.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="h-24 w-24 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-primary mb-8 relative z-10">
                                <span className="text-2xl font-bold">2</span>
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-3">Match with Companion</h3>
                            <p className="text-muted leading-relaxed">
                                We connect you with a verified, local companion who fits your criteria.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="h-24 w-24 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-primary mb-8 relative z-10">
                                <span className="text-2xl font-bold">3</span>
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-3">Receive Care & Updates</h3>
                            <p className="text-muted leading-relaxed">
                                Get real-time updates and photos after every visit.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section - Dark Premium Theme */}
            <section className="py-32 bg-primary relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl opacity-50"></div>

                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                Loved by families <br /> <span className="text-accent">across the globe.</span>
                            </h2>
                        </div>
                        <div className="md:mb-2">
                            <div className="flex -space-x-4">
                                <img className="w-12 h-12 rounded-full border-2 border-primary object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100" alt="User" />
                                <img className="w-12 h-12 rounded-full border-2 border-primary object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100" alt="User" />
                                <img className="w-12 h-12 rounded-full border-2 border-primary object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100" alt="User" />
                                <div className="w-12 h-12 rounded-full border-2 border-primary bg-gray-800 text-white flex items-center justify-center text-xs font-medium">
                                    +500
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Review 1 */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                            <div className="mb-6 text-accent">
                                <svg className="h-8 w-8 opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>
                            </div>
                            <p className="text-lg text-gray-300 font-light leading-relaxed mb-8">
                                "Living in the UK, I was constantly worried. CareUp has been a godsend. Lakshmi, our companion, is like a second daughter to my mother."
                            </p>
                            <div className="flex items-center gap-4 mt-auto">
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100" className="h-10 w-10 rounded-full object-cover border border-white/20" alt="Anjali P." />
                                <div>
                                    <p className="font-bold text-white text-sm">Anjali P.</p>
                                    <p className="text-gray-500 text-xs">London, UK</p>
                                </div>
                            </div>
                        </div>

                        {/* Review 2 */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                            <div className="mb-6 text-accent">
                                <svg className="h-8 w-8 opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>
                            </div>
                            <p className="text-lg text-gray-300 font-light leading-relaxed mb-8">
                                "The transparency is what I love. I get a photo update as soon as the visit starts. It gives me such peace of mind knowing someone trustworthy is there."
                            </p>
                            <div className="flex items-center gap-4 mt-auto">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100" className="h-10 w-10 rounded-full object-cover border border-white/20" alt="Rahul M." />
                                <div>
                                    <p className="font-bold text-white text-sm">Rahul M.</p>
                                    <p className="text-gray-500 text-xs">Dubai, UAE</p>
                                </div>
                            </div>
                        </div>

                        {/* Review 3 */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 md:col-span-2 lg:col-span-1">
                            <div className="mb-6 text-accent">
                                <svg className="h-8 w-8 opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>
                            </div>
                            <p className="text-lg text-gray-300 font-light leading-relaxed mb-8">
                                "Professional, kind, and extremely reliable. My father actually looks forward to their visits now. Thank you CareUp!"
                            </p>
                            <div className="flex items-center gap-4 mt-auto">
                                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100" className="h-10 w-10 rounded-full object-cover border border-white/20" alt="Sarah J." />
                                <div>
                                    <p className="font-bold text-white text-sm">Sarah J.</p>
                                    <p className="text-gray-500 text-xs">New York, USA</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Immersive */}
            <section className="py-24 px-4 lg:px-8 bg-background">
                <div className="container mx-auto">
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 border border-gray-800 shadow-2xl">
                        {/* Background Image with Overlay */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src="https://images.unsplash.com/photo-1470176657930-b476443c067d?q=80&w=2670&auto=format&fit=crop"
                                alt="Calm nature background"
                                className="h-full w-full object-cover opacity-40 mix-blend-overlay"
                            />
                            <div className="absolute inset-0 bg-linear-to-br from-primary/95 via-primary/80 to-accent/20"></div>
                        </div>

                        <div className="relative z-10 px-8 py-20 md:py-32 text-center max-w-4xl mx-auto">
                            <h2 className="text-5xl font-bold tracking-tight text-white sm:text-7xl mb-8 leading-tight">
                                Ready to give them <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-white/60">the care they deserve?</span>
                            </h2>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                                Join a community of families who found peace of mind with CareUp.
                                Trusted professionals, transparent updates, total love.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                <Link to="/signup">
                                    <Button size="lg" className="h-16 px-12 text-xl bg-white text-primary hover:bg-gray-100 hover:scale-105 transition-all duration-300 border-none rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                                        Get Started Now
                                    </Button>
                                </Link>
                                <p className="text-sm text-gray-400 mt-4 sm:mt-0">
                                    No credit card required.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                service={selectedService}
            />
        </div>
    );
}
