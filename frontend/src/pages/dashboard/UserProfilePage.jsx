import React, { useState, useEffect } from 'react';
import { usersApi } from '../../api/users';
import { bookingsApi } from '../../api/bookings';
import { servicesApi } from '../../api/services';
import { paymentsApi } from '../../api/payments';
import { complaintsApi } from '../../api/complaints';
import { BookingModal } from '../../components/bookings/BookingModal';
import { ComplaintModal } from '../../components/complaints/ComplaintModal';
import { FeedbackModal } from '../../components/feedback/FeedbackModal';
import { PaymentModal } from '../../components/payments/PaymentModal';
import { CareFeedModal } from '../../components/care-feed/CareFeedModal';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, MapPin, CreditCard, ChevronRight, CheckCircle, AlertCircle, User, Phone, MessageSquare, Star, Mail } from 'lucide-react';
import NotificationBell from '../../components/notifications/NotificationBell';

const UserProfilePage = () => {
    const { logout } = useAuth();
    const { success, error: toastError } = useToast();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState('profile'); // profile, bookings, services
    const [myBookings, setMyBookings] = useState([]);
    const [payments, setPayments] = useState([]);
    const [services, setServices] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
    const [selectedBookingForComplaint, setSelectedBookingForComplaint] = useState(null);
    const [selectedBookingForFeedback, setSelectedBookingForFeedback] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    // Care Feed State
    const [selectedBookingForFeed, setSelectedBookingForFeed] = useState(null);
    const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        country: '',
    });

    const [pagination, setPagination] = useState({
        bookings: { page: 1, limit: 5, total: 0 },
        complaints: { page: 1, limit: 5, total: 0 }
    });

    useEffect(() => {
        loadProfile();
        loadServices();
        loadPayments();
    }, []);

    useEffect(() => {
        if (activeTab === 'bookings') {
            loadBookings(pagination.bookings.page);
        }
        if (activeTab === 'complaints') {
            loadComplaints(pagination.complaints.page);
        }
    }, [activeTab, pagination.bookings.page, pagination.complaints.page]);

    const loadComplaints = async (page = 1) => {
        try {
            const data = await complaintsApi.getMyComplaints(page, pagination.complaints.limit);
            setComplaints(data.items || []);
            setPagination(prev => ({
                ...prev,
                complaints: { ...prev.complaints, page, total: data.total }
            }));
        } catch (err) {
            console.error("Failed to load complaints", err);
        }
    };

    const loadBookings = async (page = 1) => {
        try {
            const data = await bookingsApi.getMyBookings(page, pagination.bookings.limit);
            setMyBookings(data.items || []);
            setPagination(prev => ({
                ...prev,
                bookings: { ...prev.bookings, page, total: data.total }
            }));
        } catch (err) {
            console.error("Failed to load bookings", err);
        }
    };

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await usersApi.getProfile();
            setProfile(data);
            setFormData({
                full_name: data.full_name || '',
                phone: data.phone || '',
                country: data.country || '',
            });
        } catch (err) {
            toastError('Failed to load profile.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (type, newPage) => {
        setPagination(prev => ({
            ...prev,
            [type]: { ...prev[type], page: newPage }
        }));
    };

    const renderPagination = (type) => {
        const { page, limit, total } = pagination[type];
        const totalPages = Math.ceil(total / limit);

        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
                <div className="text-sm text-gray-500">
                    Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} results
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => handlePageChange(type, page - 1)}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => handlePageChange(type, page + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        );
    };




    const loadServices = async () => {
        try {
            const data = await servicesApi.getAll();
            setServices(data || []);
        } catch (err) {
            console.error("Failed to load services", err);
        }
    };

    const loadPayments = async () => {
        try {
            const data = await paymentsApi.getMyPayments();
            setPayments(data || []);
        } catch (err) {
            console.error("Failed to load payments", err);
        }
    };

    const handleBookNow = (service) => {
        setSelectedService(service);
        setIsBookingModalOpen(true);
    };

    const handlePayNow = (booking) => {
        setSelectedBookingForPayment(booking);
        setIsPaymentModalOpen(true);
    };

    const handleOpenComplaint = (booking) => {
        setSelectedBookingForComplaint(booking);
        setIsComplaintModalOpen(true);
    };

    const handleOpenFeed = (booking) => {
        setSelectedBookingForFeed(booking);
        setIsFeedModalOpen(true);
    };

    const handleOpenFeedback = (booking) => {
        setSelectedBookingForFeedback(booking);
        setIsFeedbackModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const updatedProfile = await usersApi.updateProfile(formData);
            setProfile(updatedProfile);
            setIsEditing(false);
            success('Profile updated successfully!');
        } catch (err) {
            toastError('Failed to update profile.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profile) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <Button variant="outline" onClick={logout} className="text-red-600 border-red-200 hover:bg-red-50">
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 rounded-xl bg-gray-200 p-1 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                            ${activeTab === 'profile' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-white/12 hover:text-primary'}
                        `}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                            ${activeTab === 'bookings' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-white/12 hover:text-primary'}
                        `}
                    >
                        My Bookings
                    </button>
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                            ${activeTab === 'services' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-white/12 hover:text-primary'}
                        `}
                    >
                        Book a Service
                    </button>
                    <button
                        onClick={() => setActiveTab('complaints')}
                        className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                            ${activeTab === 'complaints' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-white/12 hover:text-primary'}
                        `}
                    >
                        Complaints
                    </button>
                </div>

                {/* Error handled by toast */}

                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                            <Button
                                variant="outline"
                                onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                                className="bg-white hover:bg-gray-50"
                            >
                                {isEditing ? 'Cancel Edit' : 'Edit Information'}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Full Name */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <User size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Full Name</p>
                                    {isEditing ? (
                                        <Input
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleInputChange}
                                            className="font-bold text-gray-900 border-blue-200 focus:border-blue-500 h-9"
                                        />
                                    ) : (
                                        <h3 className="text-gray-900 font-bold text-lg">{profile?.full_name}</h3>
                                    )}
                                </div>
                            </div>

                            {/* Email Address */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                    <Mail size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Email Address</p>
                                    <h3 className="text-gray-900 font-bold text-lg truncate" title={profile?.email}>{profile?.email}</h3>
                                    <span className="text-orange-500 text-[10px] font-bold uppercase tracking-wider mt-1 inline-block">Verified</span>
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                    <Phone size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Phone Number</p>
                                    {isEditing ? (
                                        <Input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="font-bold text-gray-900 border-purple-200 focus:border-purple-500 h-9"
                                        />
                                    ) : (
                                        <h3 className="text-gray-900 font-bold text-lg">{profile?.phone}</h3>
                                    )}
                                </div>
                            </div>

                            {/* Country */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                                    <MapPin size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Country</p>
                                    {isEditing ? (
                                        <Input
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            className="font-bold text-gray-900 border-teal-200 focus:border-teal-500 h-9"
                                        />
                                    ) : (
                                        <h3 className="text-gray-900 font-bold text-lg">{profile?.country || 'Not Set'}</h3>
                                    )}
                                </div>
                            </div>

                            {/* Account Role */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                                    <User size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Account Role</p>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 uppercase tracking-wide">
                                        {profile?.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end pt-4">
                                <Button onClick={handleSave} isLoading={loading} className="px-8 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all">
                                    Save Changes
                                </Button>
                            </div>
                        )}

                    </div>
                )}

                {/* My Bookings Tab */}
                {activeTab === 'bookings' && (
                    <div className="bg-white rounded-lg shadow-sm min-h-[400px] p-6 space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800">Booking History</h2>
                        {myBookings.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center text-gray-500">
                                    You haven't made any bookings yet. Check out the "Book a Service" tab!
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6">
                                {myBookings.map((booking) => (
                                    <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                                        <CardContent className="p-6">
                                            {/* Header Section */}
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-bold text-gray-900">{booking.service_name}</h3>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                                booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                    'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-gray-500 text-sm">
                                                        <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                                                        {booking.hospital_name}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-gray-900">{booking.currency} {booking.price}</div>
                                                    {(() => {
                                                        const payment = payments.find(p => p.booking_id === booking.id);
                                                        if (payment?.status === 'paid') {
                                                            return <div className="text-xs font-medium text-emerald-600 flex items-center justify-end"><CheckCircle className="w-3 h-3 mr-1" /> Paid</div>;
                                                        } else if (booking.status !== 'cancelled') {
                                                            return <div className="text-xs font-medium text-amber-600 flex items-center justify-end"><AlertCircle className="w-3 h-3 mr-1" /> Payment Pending</div>;
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                            </div>

                                            {/* Info Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-8 py-4 border-t border-b border-gray-50 mb-4 text-sm">
                                                {/* Date & Time */}
                                                <div>
                                                    <div className="text-xs text-gray-400 font-medium uppercase mb-1">Schedule</div>
                                                    <div className="flex items-center text-gray-700 font-medium">
                                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                        {new Date(booking.scheduled_date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                    <div className="flex items-center text-gray-500 mt-1 pl-6 text-xs">
                                                        at {new Date(booking.scheduled_date).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>

                                                {/* Companion Info */}
                                                <div>
                                                    <div className="text-xs text-gray-400 font-medium uppercase mb-1">Companion</div>
                                                    {booking.companion_name ? (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center text-gray-700 font-medium">
                                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                                {booking.companion_name}
                                                            </div>
                                                            {booking.companion_phone && (
                                                                <a href={`tel:${booking.companion_phone}`} className="flex items-center text-emerald-600 hover:underline pl-6 text-xs">
                                                                    <Phone className="w-3 h-3 mr-1.5" />
                                                                    {booking.companion_phone}
                                                                </a>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center text-gray-400 italic">
                                                            <User className="w-4 h-4 mr-2 text-gray-300" />
                                                            Pending Assignment
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Status Context */}
                                                <div>
                                                    <div className="text-xs text-gray-400 font-medium uppercase mb-1">Updates</div>
                                                    {(booking.status === 'assigned' || booking.status === 'completed') ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOpenFeed(booking)}
                                                            className="h-auto p-0 text-zinc-500 hover:text-zinc-900 hover:bg-transparent font-medium"
                                                        >
                                                            <MessageSquare className="w-4 h-4 mr-1.5" />
                                                            View Care Feed
                                                        </Button>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-xs">No updates yet</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Bar */}
                                            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenComplaint(booking)}
                                                    className="w-full sm:w-auto text-gray-500 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    Report an Issue
                                                </Button>

                                                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                                                    {booking.status === 'completed' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleOpenFeedback(booking)}
                                                            className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 shadow-sm"
                                                        >
                                                            <Star className="w-4 h-4 mr-1.5 fill-current text-zinc-400 group-hover:text-zinc-600" />
                                                            Leave Review
                                                        </Button>
                                                    )}

                                                    {(() => {
                                                        const payment = payments.find(p => p.booking_id === booking.id);
                                                        if (!payment && booking.status !== 'cancelled') {
                                                            return (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handlePayNow(booking)}
                                                                    className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white"
                                                                >
                                                                    Pay Amount
                                                                    <ChevronRight className="w-4 h-4 ml-1" />
                                                                </Button>
                                                            );
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </div>
                                ))}
                            </div>
                        )}
                        {renderPagination('bookings')}
                    </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 px-1">Available Services</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {services.filter(s => s.is_active).map((service) => (
                                <Card key={service.id} className="flex flex-col hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6 flex flex-col h-full">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                                        <p className="text-gray-600 mb-4 flex-1">{service.description}</p>
                                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase">Starts from</span>
                                                <div className="text-lg font-bold text-accent">
                                                    {service.pricing && service.pricing.length > 0
                                                        ? `${service.pricing[0].currency} ${service.pricing[0].price}`
                                                        : 'Contact us'}
                                                </div>
                                            </div>
                                            <Button onClick={() => handleBookNow(service)}>
                                                Book Now
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Complaints Tab */}
                {activeTab === 'complaints' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 px-1">My Complaints History</h2>
                        {complaints.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center text-gray-500">
                                    You have no open complaints.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {complaints.map((complaint) => {
                                    // Find related booking details if available in myBookings
                                    const relatedBooking = myBookings.find(b => b.id === complaint.booking_id);

                                    return (
                                        <Card key={complaint.id}>
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${complaint.status === 'open' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                                }`}>
                                                                {complaint.status}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(complaint.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-gray-900">{complaint.title}</h3>
                                                        {relatedBooking && (
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                Regarding: {relatedBooking.service_name} on {new Date(relatedBooking.scheduled_date).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm mb-4">
                                                    {complaint.description}
                                                </div>

                                                {complaint.admin_response && (
                                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                                                        <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Admin Response</h4>
                                                        <p className="text-sm text-blue-900">{complaint.admin_response}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                        {renderPagination('complaints')}
                    </div>
                )}

                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => {
                        setIsBookingModalOpen(false);
                        loadBookings(); // Refresh bookings after close
                    }}
                    service={selectedService}
                />

                <ComplaintModal
                    isOpen={isComplaintModalOpen}
                    onClose={() => {
                        setIsComplaintModalOpen(false);
                        loadComplaints(); // Refresh list
                    }}
                    booking={selectedBookingForComplaint}
                />

                <FeedbackModal
                    isOpen={isFeedbackModalOpen}
                    onClose={() => setIsFeedbackModalOpen(false)}
                    booking={selectedBookingForFeedback}
                />

                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    booking={selectedBookingForPayment}
                    onPaymentSuccess={() => {
                        loadPayments();
                    }}
                />
                {/* Care Feed Modal */}
                <CareFeedModal
                    isOpen={isFeedModalOpen}
                    onClose={() => setIsFeedModalOpen(false)}
                    booking={selectedBookingForFeed}
                />
            </div>
        </div>
    );
};

export default UserProfilePage;
