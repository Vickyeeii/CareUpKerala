import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { companionsApi } from '../../api/companions';
import { hospitalsApi } from '../../api/hospitals';
import { servicesApi } from '../../api/services';
import { bookingsApi } from '../../api/bookings';
import { paymentsApi } from '../../api/payments';
import { careFeedApi } from '../../api/careFeed';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';
import NotificationBell from '../../components/notifications/NotificationBell';
import {
    LayoutDashboard,
    Users,
    Building2,
    Stethoscope,
    Calendar,
    Activity,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Wallet,
    MessageSquare,
    BellRing,
    AlertCircle,
    Star,
    Globe,
    Clock,
    CheckCircle
} from 'lucide-react';
import { notificationsApi } from '../../api/notifications';
import { dashboardApi } from '../../api/dashboard';
import ComplaintsPage from './ComplaintsPage';
import FeedbackPage from './FeedbackPage';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const { success, error: toastError } = useToast();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);
    const [revenueStats, setRevenueStats] = useState(null);
    const [bookingStats, setBookingStats] = useState(null);
    const [complaintStats, setComplaintStats] = useState(null);
    const [companionStats, setCompanionStats] = useState(null);

    const [pendingCompanions, setPendingCompanions] = useState([]);
    const [logs, setLogs] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Hospital Modal State
    const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
    const [currentHospital, setCurrentHospital] = useState(null);
    const [hospitalForm, setHospitalForm] = useState({
        name: '',
        location: '',
        address: '',
        phone: ''
    });

    // Service Modal State
    const [services, setServices] = useState([]);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const [serviceForm, setServiceForm] = useState({
        name: '',
        description: '',
        is_active: true
    });

    // Pricing Modal State
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [pricingForm, setPricingForm] = useState({
        price: '',
        currency: 'INR'
    });
    const [currentServicePricing, setCurrentServicePricing] = useState(null); // The service we are adding pricing for
    const [editingPricingId, setEditingPricingId] = useState(null); // The specific pricing ID if editing

    // Booking State
    const [bookings, setBookings] = useState([]);
    const [bookingCompanions, setBookingCompanions] = useState([]); // For assignment dropdown
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedCompanionId, setSelectedCompanionId] = useState('');

    // Payment State
    const [payments, setPayments] = useState([]);

    // Care Feed State
    const [careFeeds, setCareFeeds] = useState([]);


    useEffect(() => {
        setPage(1); // Reset page on tab change
        loadData(1); // Load first page
    }, [activeTab]);

    useEffect(() => {
        if (page > 1) {
            loadData(page);
        }
    }, [page]);

    const loadData = async (currentPage = 1) => {
        setLoading(true);
        try {
            if (activeTab === 'overview') {
                // Fetch all dashboard stats in parallel
                const [overviewData, revenueData, bookingStatusData, complaintData, companionData] = await Promise.all([
                    dashboardApi.getOverview(),
                    dashboardApi.getRevenue(),
                    dashboardApi.getBookingStatus(),
                    dashboardApi.getComplaintSummary(),
                    dashboardApi.getCompanionSummary()
                ]);

                setStats(overviewData);
                setRevenueStats(revenueData);
                setBookingStats(bookingStatusData);
                setComplaintStats(complaintData);
                setCompanionStats(companionData);

            } else if (activeTab === 'companions') {
                const data = await companionsApi.getPendingCompanions(currentPage, ITEMS_PER_PAGE);
                setPendingCompanions(data.companions || []);
                setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE));
            } else if (activeTab === 'logs') {
                const data = await adminApi.getLogs(currentPage, ITEMS_PER_PAGE);
                setLogs(data.logs || []);
                setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE));
            } else if (activeTab === 'hospitals') {
                const data = await hospitalsApi.getAll();
                setHospitals(data || []);
                setTotalPages(1); // Hospitals not paginated yet
            } else if (activeTab === 'services') {
                const data = await servicesApi.getAll();
                setServices(data || []);
                setTotalPages(1); // Services not paginated yet
            } else if (activeTab === 'bookings') {
                const data = await bookingsApi.getAll(currentPage, ITEMS_PER_PAGE);
                setBookings(data.items || []);
                setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE));
            } else if (activeTab === 'payments') {
                const data = await paymentsApi.getAll();
                setPayments(data || []);
                setTotalPages(1);
            } else if (activeTab === 'care-feed') {
                const data = await careFeedApi.getAll();
                setCareFeeds(data || []);
                setTotalPages(1);
            }
        } catch (err) {
            console.error(err);
            toastError('Failed to load data. Ensure you have admin privileges.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await companionsApi.approveCompanion(id);
            // Refresh list
            loadData(page);
            success('Companion approved successfully.');
        } catch (err) {
            console.error(err);
            toastError('Failed to approve companion.');
        }
    };

    const handleDeactivate = async (id) => {
        try {
            await companionsApi.deactivateCompanion(id);
            // Refresh list
            loadData(page);
            success('Companion rejected/deactivated.');
        } catch (err) {
            console.error(err);
            toastError('Failed to deactivate companion.');
        }
    };



    // Hospital Handlers
    const handleAddHospital = () => {
        setCurrentHospital(null);
        setHospitalForm({ name: '', location: '', address: '', phone: '' });
        setIsHospitalModalOpen(true);
    };

    const handleEditHospital = (hospital) => {
        setCurrentHospital(hospital);
        setHospitalForm({
            name: hospital.name,
            location: hospital.location,
            address: hospital.address,
            phone: hospital.phone
        });
        setIsHospitalModalOpen(true);
    };

    // Confirmation Modal State
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmTitle, setConfirmTitle] = useState('Confirm Action');
    const [confirmMessage, setConfirmMessage] = useState('Are you sure you want to perform this action?');

    const handleSaveHospital = async (e) => {
        e.preventDefault();
        try {
            if (currentHospital) {
                await hospitalsApi.update(currentHospital.id, hospitalForm);
                success('Hospital updated successfully');
            } else {
                await hospitalsApi.create(hospitalForm);
                success('Hospital created successfully');
            }
            setIsHospitalModalOpen(false);
            loadData(page);
        } catch (err) {
            console.error(err);
            toastError('Failed to save hospital');
        }
    };



    const handleDeleteHospital = (id) => {
        confirmDelete(() => async () => {
            try {
                await hospitalsApi.delete(id);
                success('Hospital deleted successfully');
                loadData(page);
            } catch (err) {
                console.error(err);
                toastError('Failed to delete hospital');
            }
        }, 'Delete Hospital', 'Are you sure you want to delete this hospital? This action cannot be undone.');
    };

    const confirmDelete = (action, title, message) => {
        setConfirmAction(action);
        setConfirmTitle(title);
        setConfirmMessage(message);
        setIsConfirmOpen(true);
    };

    // Service Handlers
    const handleAddService = () => {
        setCurrentService(null);
        setServiceForm({ name: '', description: '', is_active: true });
        setIsServiceModalOpen(true);
    };

    const handleEditService = (service) => {
        setCurrentService(service);
        setServiceForm({
            name: service.name,
            description: service.description,
            is_active: service.is_active
        });
        setIsServiceModalOpen(true);
    };

    const handleSaveService = async (e) => {
        e.preventDefault();
        try {
            if (currentService) {
                await servicesApi.update(currentService.id, serviceForm);
                success('Service updated successfully');
            } else {
                await servicesApi.create(serviceForm);
                success('Service created successfully');
            }
            setIsServiceModalOpen(false);
            loadData(page);
        } catch (err) {
            console.error(err);
            toastError('Failed to save service');
        }
    };

    const handleDeleteService = (id) => {
        confirmDelete(() => async () => {
            try {
                await servicesApi.delete(id);
                success('Service deleted successfully');
                loadData(page);
            } catch (err) {
                console.error(err);
                toastError('Failed to delete service');
            }
        }, 'Delete Service', 'Are you sure you want to delete this service?');
    };

    const handleDeleteCareFeed = (id) => {
        confirmDelete(() => async () => {
            try {
                await careFeedApi.delete(id);
                success('Care feed entry deleted successfully');
                loadData(page);
            } catch (err) {
                console.error(err);
                toastError('Failed to delete care feed entry');
            }
        }, 'Delete Care Feed', 'Are you sure you want to delete this update?');
    };

    const handleOpenPricing = (service) => {
        setCurrentServicePricing(service);
        // Check if service already has pricing (assuming single active pricing or taking the first one for now)
        if (service.pricing && service.pricing.length > 0) {
            const priceData = service.pricing[0];
            setPricingForm({ price: priceData.price, currency: priceData.currency });
            setEditingPricingId(priceData.id);
        } else {
            setPricingForm({ price: '', currency: 'INR' });
            setEditingPricingId(null);
        }
        setIsPricingModalOpen(true);
    };

    const handleSavePricing = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...pricingForm,
                service_id: currentServicePricing.id
            };

            if (editingPricingId) {
                await servicesApi.updatePricing(editingPricingId, { price: pricingForm.price, currency: pricingForm.currency });
                success('Pricing updated successfully');
            } else {
                await servicesApi.addPricing(payload);
                success('Pricing added successfully');
            }
            setIsPricingModalOpen(false);
            loadData(page);
        } catch (err) {
            console.error(err);
            toastError('Failed to save pricing');
        }
    };

    // Booking Handlers
    const handleOpenAssignment = async (booking) => {
        if (booking.status === 'completed' || booking.status === 'cancelled') {
            toastError('Cannot assign companion to completed or cancelled booking');
            return;
        }
        setSelectedBooking(booking);
        try {
            const data = await companionsApi.getPublicCompanions();
            setBookingCompanions(data || []);
            setIsAssignmentModalOpen(true);
        } catch (err) {
            toastError('Failed to load companions');
        }
    };

    const handleAssignCompanion = async (e) => {
        e.preventDefault();
        if (!selectedCompanionId) return;
        try {
            await bookingsApi.assignCompanion(selectedBooking.id, selectedCompanionId);
            success('Companion assigned successfully');
            setIsAssignmentModalOpen(false);
            loadData(page);
        } catch (err) {
            toastError(err.response?.data?.detail || 'Failed to assign companion');
        }
    };

    const handleUpdateStatus = async (bookingId, newStatus) => {
        try {
            await bookingsApi.updateStatus(bookingId, newStatus);
            success('Booking status updated');
            loadData(page);
        } catch (err) {
            toastError('Failed to update status');
        }
    };

    const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
        try {
            await paymentsApi.updateStatus(paymentId, newStatus);
            success('Payment status updated');
            loadData(page);
        } catch (err) {
            toastError('Failed to update payment status');
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'companions', label: 'Companions', icon: Users },
        { id: 'hospitals', label: 'Hospitals', icon: Building2 },
        { id: 'services', label: 'Services', icon: Stethoscope },
        { id: 'bookings', label: 'Bookings', icon: Calendar },
        { id: 'payments', label: 'Payments', icon: Wallet },
        { id: 'complaints', label: 'Complaints', icon: AlertCircle },
        { id: 'reviews', label: 'Reviews', icon: Star },
        { id: 'care-feed', label: 'Care Feed', icon: MessageSquare },
        { id: 'logs', label: 'Activity Logs', icon: Activity },
    ];

    const PaginationControls = () => {
        if (totalPages <= 1) return null;
        return (
            <div className="flex justify-center items-center space-x-4 mt-6">
                <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    Previous
                </Button>
                <span className="text-gray-600 font-medium">
                    Page {page} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                >
                    Next
                </Button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:shadow-none shadow-xl",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Activity className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">CareUp</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 md:hidden"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setIsSidebarOpen(false);
                                }}
                                className={cn(
                                    "flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 bg-transparent"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-white" : "text-gray-400")} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-600 md:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 capitalize tracking-tight">
                            {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-gray-900">Admin</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-linear-to-tr from-primary to-accent flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
                            A
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">

                        {/* Error handled by toast */}

                        {/* Content */}
                        {loading && !hospitals.length && !pendingCompanions.length && !logs.length && !stats && !bookings.length && !payments.length ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                            </div>
                        ) : (
                            <div className="animate-fade-in-up">
                                {/* Overview Tab */}
                                {activeTab === 'overview' && stats && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h2>
                                                <p className="text-gray-500 mt-1">Platform performance metrics</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-medium text-gray-600 shadow-sm flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    Live Data
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {/* 1. REVENUE (2x1) - The Anchor */}
                                            <div className="col-span-1 lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                                                <div className="relative z-10 flex flex-col h-full justify-between">
                                                    <div className="flex justify-between items-start">
                                                        <div className="p-3 bg-emerald-50 rounded-2xl">
                                                            <Wallet className="w-6 h-6 text-emerald-600" />
                                                        </div>
                                                        <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-medium">
                                                            +12.5%
                                                        </span>
                                                    </div>
                                                    <div className="mt-8">
                                                        <p className="text-gray-500 font-medium mb-2">Total Revenue</p>
                                                        <h3 className="text-6xl font-bold text-gray-900 tracking-tighter">
                                                            ₹{revenueStats?.total_revenue?.toLocaleString('en-IN') || 0}
                                                        </h3>
                                                    </div>
                                                </div>
                                                {/* Decorative background element */}
                                                <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-10 translate-y-10 group-hover:scale-110 transition-transform duration-500">
                                                    <Wallet className="w-64 h-64 text-gray-900" />
                                                </div>
                                            </div>

                                            {/* 2. TOTAL USERS (1x1) - Minimalist */}
                                            <div className="col-span-1 bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                                                <div className="flex flex-col h-full justify-between">
                                                    <div className="flex justify-between items-start">
                                                        <div className="p-3 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                                            <Users className="w-6 h-6 text-gray-700" />
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                            <span className="text-xs font-medium text-gray-600">Active</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <h3 className="text-5xl font-bold mb-2 tracking-tight text-gray-900">{stats?.total_nri_users || 0}</h3>
                                                        <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Total Users</p>
                                                    </div>

                                                    {/* Mini Status Dots */}
                                                    <div className="flex gap-1 mt-4">
                                                        {[...Array(6)].map((_, i) => (
                                                            <div key={i} className={`h-1.5 flex-1 rounded-full ${i < 4 ? 'bg-gray-200' : 'bg-gray-100'}`}></div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 3. TOTAL BOOKINGS (1x1) - Minimalist */}
                                            <div className="col-span-1 bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                                                {/* Subtle Pattern (Fixed Syntax) */}
                                                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000000_1px,transparent_1px)] bg-size-[16px_16px]"></div>

                                                <div className="flex flex-col h-full justify-between relative z-10">
                                                    <div className="flex justify-between items-start">
                                                        <div className="p-3 bg-emerald-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                                            <Calendar className="w-6 h-6 text-emerald-600" />
                                                        </div>
                                                        <div className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                                                            <span className="text-xs font-bold text-emerald-700">+3 Today</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4">
                                                        <h3 className="text-5xl font-bold mb-2 tracking-tight text-gray-900">{stats?.total_bookings || 0}</h3>
                                                        <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Total Bookings</p>
                                                    </div>

                                                    {/* Progress Line */}
                                                    <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                        <div className="bg-emerald-500 h-full rounded-full w-[70%] shadow-sm"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 4. BOOKING STATUS (2x1) */}
                                            <div className="col-span-1 lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="p-2 bg-gray-50 rounded-xl">
                                                        <Activity className="w-5 h-5 text-gray-600" />
                                                    </div>
                                                    <h3 className="font-bold text-gray-900">Booking Status</h3>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-amber-50 rounded-3xl border border-amber-100">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-amber-700 font-medium">Pending</span>
                                                            <Clock className="w-4 h-4 text-amber-500" />
                                                        </div>
                                                        <p className="text-3xl font-bold text-gray-900">{bookingStats?.status_counts?.pending || 0}</p>
                                                    </div>
                                                    <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-100">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-emerald-700 font-medium">Active</span>
                                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                        </div>
                                                        <div className="flex items-baseline gap-1">
                                                            <p className="text-3xl font-bold text-gray-900">{bookingStats?.status_counts?.assigned || 0}</p>
                                                            <span className="text-sm text-gray-500">/ {(bookingStats?.status_counts?.assigned || 0) + (bookingStats?.status_counts?.pending || 0)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 5. NETWORK HEALTH (1x1) */}
                                            <div className="col-span-1 bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                                                <div className="flex items-center justify-between mb-8">
                                                    <h3 className="font-bold text-gray-900">Network</h3>
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-500">Active Companions</span>
                                                        <span className="font-bold text-gray-900">{companionStats?.approved || 0}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                                                    </div>
                                                    <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                                                        <span className="text-gray-500">Pending</span>
                                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">
                                                            {companionStats?.pending || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 6. ACTION ITEMS (1x1) */}
                                            <div className="col-span-1 bg-white rounded-[2.5rem] p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                                                <div className="flex items-center justify-between mb-8">
                                                    <h3 className="font-bold text-gray-900">Attention</h3>
                                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-2xl">
                                                        <span className="text-red-700 font-medium text-sm">Open Complaints</span>
                                                        <span className="font-bold text-red-700">{complaintStats?.status_counts?.open || 0}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-2xl">
                                                        <span className="text-amber-700 font-medium text-sm">Failed Payments</span>
                                                        <span className="font-bold text-amber-700">{revenueStats?.failed_payments || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Complaints Tab */}
                                {activeTab === 'complaints' && (
                                    <ComplaintsPage />
                                )}

                                {/* Reviews Tab */}
                                {activeTab === 'reviews' && (
                                    <FeedbackPage />
                                )}

                                {/* Companions Tab */}
                                {activeTab === 'companions' && (
                                    <Card>
                                        <CardHeader>
                                            <h3 className="text-lg font-bold text-gray-900">Pending Approvals ({pendingCompanions.length})</h3>
                                        </CardHeader>
                                        <CardContent>
                                            {pendingCompanions.length === 0 ? (
                                                <p className="text-gray-500 py-4 text-center">No pending companions found.</p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {pendingCompanions.map((companion) => (
                                                                <tr key={companion.id}>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{companion.full_name}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{companion.email}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{companion.phone}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {new Date(companion.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                                        <button
                                                                            onClick={() => handleApprove(companion.id)}
                                                                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-full transition-colors"
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeactivate(companion.id)}
                                                                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-full transition-colors"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    <PaginationControls />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Hospitals Tab */}
                                {activeTab === 'hospitals' && (
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <h3 className="text-lg font-bold text-gray-900">Registered Hospitals</h3>
                                            <Button onClick={handleAddHospital} size="sm">
                                                + Add Hospital
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            {hospitals.length === 0 ? (
                                                <p className="text-gray-500 py-4 text-center">No hospitals registered yet.</p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {hospitals.map((hospital) => (
                                                                <tr key={hospital.id}>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hospital.name}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.location}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hospital.phone}</td>
                                                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={hospital.address}>{hospital.address}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                        <div className="flex justify-end gap-2">
                                                                            <Button
                                                                                onClick={() => handleEditHospital(hospital)}
                                                                                variant="secondary"
                                                                                size="sm"
                                                                            >
                                                                                Edit
                                                                            </Button>
                                                                            <Button
                                                                                onClick={() => handleDeleteHospital(hospital.id)}
                                                                                variant="danger"
                                                                                size="sm"
                                                                            >
                                                                                Delete
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Logs Tab */}
                                {activeTab === 'logs' && (
                                    <Card>
                                        <CardHeader>
                                            <h3 className="text-lg font-bold text-gray-900">System Activity Logs</h3>
                                        </CardHeader>
                                        <CardContent>
                                            {logs.length === 0 ? (
                                                <p className="text-gray-500 py-4 text-center">No logs found.</p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {logs.map((log) => (
                                                                <tr key={log.id}>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {new Date(log.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                                            {log.action_type}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                                                                        {log.description}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {log.entity_type}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    <PaginationControls />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Services Tab */}
                                {activeTab === 'services' && (
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <h3 className="text-lg font-bold text-gray-900">Services</h3>
                                            <Button onClick={handleAddService} size="sm">
                                                + Add Service
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            {services.length === 0 ? (
                                                <p className="text-gray-500 py-4 text-center">No services found.</p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {services.map((service) => (
                                                                <tr key={service.id}>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                                                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{service.description}</td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {service.pricing && service.pricing.length > 0 ? (
                                                                            `${service.pricing[0].currency} ${service.pricing[0].price}`
                                                                        ) : (
                                                                            <span className="text-gray-400 italic">No price</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={cn(
                                                                            "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                                                            service.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                                        )}>
                                                                            {service.is_active ? "Active" : "Inactive"}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                        <div className="flex justify-end gap-2">
                                                                            <Button
                                                                                onClick={() => handleEditService(service)}
                                                                                variant="secondary"
                                                                                size="sm"
                                                                            >
                                                                                Edit
                                                                            </Button>
                                                                            <Button
                                                                                onClick={() => handleOpenPricing(service)}
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                                            >
                                                                                Pricing
                                                                            </Button>
                                                                            <Button
                                                                                onClick={() => handleDeleteService(service.id)}
                                                                                variant="danger"
                                                                                size="sm"
                                                                            >
                                                                                Delete
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Payments Tab */}
                                {activeTab === 'payments' && (
                                    <Card>
                                        <CardHeader>
                                            <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
                                        </CardHeader>
                                        <CardContent>
                                            {payments.length === 0 ? (
                                                <p className="text-gray-500 py-4 text-center">No transactions found.</p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {payments.map((payment) => (
                                                                <tr key={payment.id}>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {new Date(payment.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-500 text-xs">
                                                                        {payment.booking_id}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                                        {payment.currency} {payment.amount}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                                        {payment.payment_method || 'N/A'}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={cn(
                                                                            "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                                                            payment.status === 'paid' ? "bg-green-100 text-green-800" :
                                                                                payment.status === 'failed' ? "bg-red-100 text-red-800" :
                                                                                    "bg-yellow-100 text-yellow-800"
                                                                        )}>
                                                                            {payment.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                        {payment.status === 'pending' && (
                                                                            <div className="flex justify-end gap-2">
                                                                                <button
                                                                                    onClick={() => handleUpdatePaymentStatus(payment.id, 'paid')}
                                                                                    className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-full transition-colors"
                                                                                >
                                                                                    Mark Paid
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleUpdatePaymentStatus(payment.id, 'failed')}
                                                                                    className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-full transition-colors"
                                                                                >
                                                                                    Reject
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Care Feed Tab */}
                                {activeTab === 'care-feed' && (
                                    <Card>
                                        <CardHeader>
                                            <h3 className="text-lg font-bold text-gray-900">Care Feed Updates</h3>
                                        </CardHeader>
                                        <CardContent>
                                            {careFeeds.length === 0 ? (
                                                <p className="text-gray-500 py-4 text-center">No care feed updates found.</p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Companion</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {careFeeds.map((feed) => (
                                                                <tr key={feed.id}>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {new Date(feed.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {feed.nri_name || feed.booking_id}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                                                                        {feed.message}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {feed.companion_name || feed.companion_id}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                                                        <Button
                                                                            onClick={() => handleDeleteCareFeed(feed.id)}
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-red-600 hover:text-red-900 hover:bg-red-50"
                                                                        >
                                                                            <LogOut className="w-4 h-4 mr-1" />
                                                                            Delete
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Bookings Tab */}
                                {activeTab === 'bookings' && (
                                    <Card>
                                        <CardHeader>
                                            <h3 className="text-lg font-bold text-gray-900">Bookings</h3>
                                        </CardHeader>
                                        <CardContent>
                                            {bookings.length === 0 ? (
                                                <p className="text-gray-500 py-4 text-center">No bookings found.</p>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Companion</th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {bookings.map((booking) => (
                                                                <tr key={booking.id}>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {new Date(booking.scheduled_date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                        {booking.nri_name || 'N/A'}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                                        <div className="font-medium text-gray-900">{booking.hospital_name}</div>
                                                                        <div className="text-xs">{booking.service_name}</div>
                                                                        <div className="text-xs text-gray-400">{booking.currency} {booking.price}</div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                        {booking.companion_name ? (
                                                                            <span className="text-green-600 font-medium">{booking.companion_name}</span>
                                                                        ) : (
                                                                            <span className="text-amber-500 italic">Unassigned</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={cn(
                                                                            "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                                                            booking.status === 'completed' ? "bg-green-100 text-green-800" :
                                                                                booking.status === 'confirmed' ? "bg-blue-100 text-blue-800" :
                                                                                    booking.status === 'assigned' ? "bg-purple-100 text-purple-800" :
                                                                                        booking.status === 'cancelled' ? "bg-red-100 text-red-800" :
                                                                                            "bg-yellow-100 text-yellow-800"
                                                                        )}>
                                                                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                        <div className="flex justify-end gap-2">
                                                                            {!booking.companion_id && booking.status !== 'cancelled' && (
                                                                                <Button size="sm" variant="secondary" onClick={() => handleOpenAssignment(booking)}>
                                                                                    Assign
                                                                                </Button>
                                                                            )}
                                                                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                                                <select
                                                                                    value={booking.status}
                                                                                    onChange={(e) => handleUpdateStatus(booking.id, e.target.value)}
                                                                                    className="text-xs border-gray-300 rounded-md shadow-sm focus:border-accent focus:ring-accent"
                                                                                >
                                                                                    <option value="pending">Pending</option>
                                                                                    <option value="assigned">Assigned</option>
                                                                                    <option value="completed">Completed</option>
                                                                                    <option value="cancelled">Cancelled</option>
                                                                                </select>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    <PaginationControls />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}


                        {/* Hospital Modal */}
                        <Modal
                            isOpen={isHospitalModalOpen}
                            onClose={() => setIsHospitalModalOpen(false)}
                            title={currentHospital ? 'Edit Hospital' : 'Add New Hospital'}
                        >
                            <form onSubmit={handleSaveHospital} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                                    <Input
                                        required
                                        value={hospitalForm.name}
                                        onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })}
                                        placeholder="e.g. City General Hospital"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <Input
                                        required
                                        value={hospitalForm.location}
                                        onChange={(e) => setHospitalForm({ ...hospitalForm, location: e.target.value })}
                                        placeholder="e.g. Kochi, Kerala"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <Input
                                        required
                                        value={hospitalForm.phone}
                                        onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })}
                                        placeholder="e.g. +91 9876543210"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        required
                                        value={hospitalForm.address}
                                        onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 bg-gray-50"
                                        rows={3}
                                        placeholder="Enter full address"
                                    />
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button type="submit">
                                        {currentHospital ? 'Update Hospital' : 'Add Hospital'}
                                    </Button>
                                </div>
                            </form>
                        </Modal>

                        {/* Confirmation Modal */}
                        <ConfirmationModal
                            isOpen={isConfirmOpen}
                            onClose={() => setIsConfirmOpen(false)}
                            onConfirm={confirmAction}
                            title={confirmTitle}
                            message={confirmMessage}
                            confirmText="Delete"
                            variant="danger"
                        />

                        {/* Service Modal */}
                        <Modal
                            isOpen={isServiceModalOpen}
                            onClose={() => setIsServiceModalOpen(false)}
                            title={currentService ? 'Edit Service' : 'Add New Service'}
                        >
                            <form onSubmit={handleSaveService} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                                    <Input
                                        required
                                        value={serviceForm.name}
                                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                                        placeholder="e.g. Elderly Care"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        required
                                        value={serviceForm.description}
                                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 bg-gray-50"
                                        rows={3}
                                        placeholder="Enter service description"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={serviceForm.is_active}
                                        onChange={(e) => setServiceForm({ ...serviceForm, is_active: e.target.checked })}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                        Active Service
                                    </label>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button type="submit">
                                        {currentService ? 'Update Service' : 'Add Service'}
                                    </Button>
                                </div>
                            </form>
                        </Modal>
                        {/* Pricing Modal */}
                        <Modal
                            isOpen={isPricingModalOpen}
                            onClose={() => setIsPricingModalOpen(false)}
                            title={`Manage Pricing - ${currentServicePricing?.name || ''}`}
                        >
                            <form onSubmit={handleSavePricing} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <Input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={pricingForm.price}
                                        onChange={(e) => setPricingForm({ ...pricingForm, price: e.target.value })}
                                        placeholder="e.g. 500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                    <select
                                        value={pricingForm.currency}
                                        onChange={(e) => setPricingForm({ ...pricingForm, currency: e.target.value })}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 bg-gray-50"
                                    >
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button type="submit">
                                        Save Pricing
                                    </Button>
                                </div>
                            </form>
                        </Modal>

                        {/* Assignment Modal */}
                        <Modal
                            isOpen={isAssignmentModalOpen}
                            onClose={() => setIsAssignmentModalOpen(false)}
                            title="Assign Companion"
                        >
                            <form onSubmit={handleAssignCompanion} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Companion</label>
                                    <select
                                        required
                                        value={selectedCompanionId}
                                        onChange={(e) => setSelectedCompanionId(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 bg-gray-50"
                                    >
                                        <option value="">-- Select Companion --</option>
                                        {bookingCompanions.map((comp) => (
                                            <option key={comp.id} value={comp.id}>
                                                {comp.full_name} ({comp.availability_status})
                                            </option>
                                        ))}
                                    </select>
                                    {bookingCompanions.length === 0 && (
                                        <p className="text-xs text-red-500 mt-1">No active companions found.</p>
                                    )}
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={!selectedCompanionId}>
                                        Assign
                                    </Button>
                                </div>
                            </form>
                        </Modal>
                    </div>
                </div>
            </main >
        </div >
    );
};

export default AdminDashboard;
