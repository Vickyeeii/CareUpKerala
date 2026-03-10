import React, { useState, useEffect } from 'react';
import { companionsApi } from '../../api/companions';
import { bookingsApi } from '../../api/bookings';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PostCareFeedModal } from '../../components/care-feed/PostCareFeedModal';
import { CareFeedModal } from '../../components/care-feed/CareFeedModal';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { Calendar, Clock, MapPin, Activity, User, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import NotificationBell from '../../components/notifications/NotificationBell';

const CompanionDashboard = () => {
    const { logout } = useAuth();
    const { success, error: toastError } = useToast();
    const [profile, setProfile] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Modals
    const [selectedBookingForUpdate, setSelectedBookingForUpdate] = useState(null);
    const [selectedBookingForView, setSelectedBookingForView] = useState(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: '',
        phone: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (profile) {
            setEditForm({
                full_name: profile.full_name || '',
                phone: profile.phone || ''
            });
        }
    }, [profile]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [profileData, bookingsData] = await Promise.all([
                companionsApi.getMyProfile(),
                bookingsApi.getMyBookings()
            ]);
            setProfile(profileData);
            setBookings(bookingsData.items || []);
        } catch (err) {
            toastError('Failed to load dashboard data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            const updatedProfile = await companionsApi.updateProfile(editForm);
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

    const toggleAvailability = async () => {
        try {
            setLoading(true);
            const newStatus = profile.availability_status === 'available' ? 'unavailable' : 'available';
            const updatedProfile = await companionsApi.updateAvailability(newStatus);
            setProfile(updatedProfile);
            success(`You are now ${newStatus === 'available' ? 'Online' : 'Offline'}`);
        } catch (err) {
            toastError('Failed to update availability.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkCompleted = async (bookingId) => {
        // Confirmation is handled by modal now
        try {
            setLoading(true);
            await bookingsApi.updateStatus(bookingId, 'completed');
            success('Booking marked as completed!');
            loadData(); // Refresh list
        } catch (err) {
            toastError('Failed to complete booking.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profile) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Companion Dashboard</h1>
                            <p className="text-gray-500 mt-1">Welcome back, {profile?.full_name}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${profile?.availability_status === 'available'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {profile?.availability_status === 'available' ? 'Online' : 'Offline'}
                            </span>
                            <div className="mx-2">
                                <NotificationBell />
                            </div>
                            <Button variant="outline" onClick={logout} className="text-red-600 border-red-200 hover:bg-red-50">
                                Logout
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-8 mt-8 border-b border-gray-200 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'overview'
                                ? 'border-accent text-accent'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('assignments')}
                            className={`pb-4 px-1 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === 'assignments'
                                ? 'border-accent text-accent'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            My Assignments
                            {bookings.length > 0 && (
                                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                                    {bookings.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'overview' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Status Card */}
                        <Card className="col-span-1 shadow-sm rounded-xl overflow-hidden h-full">
                            <CardContent className="p-8 flex flex-col items-center justify-center h-full">
                                <h3 className="text-gray-500 font-medium mb-8">Availability</h3>

                                <div className={`relative flex items-center justify-center w-24 h-24 rounded-full mb-8 transition-all duration-500 ${profile?.availability_status === 'available'
                                        ? 'bg-emerald-50 text-emerald-500'
                                        : 'bg-gray-50 text-gray-400'
                                    }`}>
                                    {profile?.availability_status === 'available' && (
                                        <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-20"></div>
                                    )}
                                    <Activity className={`w-10 h-10 ${profile?.availability_status === 'available' ? 'text-emerald-500' : 'text-gray-400'}`} />
                                </div>

                                <h2 className="text-2xl font-bold text-gray-900 mb-8 capitalize">
                                    {profile?.availability_status || 'Unavailable'}
                                </h2>

                                <Button
                                    onClick={toggleAvailability}
                                    className={`w-full py-6 rounded-xl text-base font-semibold shadow-sm transition-all ${profile?.availability_status === 'available'
                                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
                                            : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
                                        }`}
                                >
                                    {profile?.availability_status === 'available' ? 'Go Offline' : 'Go Online'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Profile Details */}
                        <Card className="col-span-1 md:col-span-2 shadow-sm rounded-xl overflow-hidden h-full">
                            <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-gray-50">
                                <CardTitle className="text-xl font-bold text-gray-900">Profile Details</CardTitle>
                                <Button
                                    variant="ghost"
                                    onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                                    className="text-xs font-medium text-gray-500 hover:text-gray-900"
                                >
                                    {isEditing ? 'Save Details' : 'Edit Profile'}
                                </Button>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm text-gray-400 font-normal">
                                            <User className="w-4 h-4" /> Full Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.full_name}
                                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                                className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-zinc-900 focus:ring-zinc-900 p-2.5 text-sm transition-all"
                                            />
                                        ) : (
                                            <p className="text-lg font-medium text-gray-900">{profile?.full_name}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm text-gray-400 font-normal">
                                            <Mail className="w-4 h-4" /> Email
                                        </label>
                                        <p className="text-lg font-medium text-gray-900">{profile?.email}</p>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm text-gray-400 font-normal">
                                            <Phone className="w-4 h-4" /> Phone
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="w-full rounded-lg border-gray-200 bg-gray-50 focus:bg-white focus:border-zinc-900 focus:ring-zinc-900 p-2.5 text-sm transition-all"
                                            />
                                        ) : (
                                            <p className="text-lg font-medium text-gray-900">{profile?.phone}</p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm text-gray-400 font-normal">
                                            <CheckCircle className="w-4 h-4" /> Status
                                        </label>
                                        <div>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${profile?.status
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                {profile?.status ? 'Active' : 'Pending Approval'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {isEditing && (
                                    <div className="flex justify-end pt-6 border-t border-gray-50 mt-8">
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditForm({ full_name: profile?.full_name || '', phone: profile?.phone || '' });
                                            }}
                                            className="text-gray-400 hover:text-gray-600 mr-2"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    /* Assignments Tab */
                    <div className="space-y-6">
                        {bookings.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                                    <Calendar className="h-6 w-6 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No Assignments Yet</h3>
                                <p className="mt-2 text-gray-500">You haven't been assigned to any service requests yet.</p>
                                <div className="mt-6">
                                    <Button onClick={toggleAvailability} variant="outline">
                                        Check Availability Status
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            bookings.map((booking) => (
                                <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                    <CardContent className="p-0">
                                        <div className="p-6">
                                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                                                <div className="space-y-4 flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide mb-2 ${booking.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                    'bg-indigo-100 text-indigo-800'
                                                                }`}>
                                                                {booking.status}
                                                            </span>
                                                            <h3 className="text-xl font-bold text-gray-900">{booking.service_name}</h3>
                                                            <div className="flex items-center text-gray-500 mt-1 text-sm">
                                                                <MapPin className="w-4 h-4 mr-1" />
                                                                {booking.hospital_name}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                                                            <span className="font-medium mr-2">Date:</span>
                                                            {new Date(booking.scheduled_date).toLocaleString('en-IN', {
                                                                timeZone: 'Asia/Kolkata',
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                                                            <span className="font-medium mr-2">Time:</span>
                                                            {new Date(booking.scheduled_date).toLocaleString('en-IN', {
                                                                timeZone: 'Asia/Kolkata',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <User className="w-4 h-4 mr-2 text-indigo-500" />
                                                            <span className="font-medium mr-2">Booked By:</span>
                                                            {booking.nri_name || 'N/A'}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="font-medium mr-2 text-gray-400">ID:</span>
                                                            <span className="font-mono text-xs bg-gray-200 px-1 py-0.5 rounded">{booking.id.slice(0, 8)}</span>
                                                        </div>

                                                        {/* Patient Details */}
                                                        {booking.patient_name && (
                                                            <>
                                                                <div className="flex items-center col-span-1 sm:col-span-2 pt-2 border-t border-gray-200 mt-1">
                                                                    <Activity className="w-4 h-4 mr-2 text-emerald-600" />
                                                                    <span className="font-medium mr-2 text-gray-900">Patient:</span>
                                                                    <span className="text-gray-900 font-semibold">
                                                                        {booking.patient_name}
                                                                        <span className="text-gray-500 font-normal ml-1">
                                                                            ({booking.patient_age}, {booking.patient_gender})
                                                                        </span>
                                                                    </span>
                                                                    {booking.patient_phone && (
                                                                        <div className="flex items-center ml-4 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-medium">
                                                                            <Phone className="w-3 h-3 mr-1" />
                                                                            <a href={`tel:${booking.patient_phone}`} className="hover:underline">
                                                                                {booking.patient_phone}
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {booking.patient_notes && (
                                                                    <div className="col-span-1 sm:col-span-2 text-xs bg-amber-50 text-amber-900 p-3 rounded border border-amber-100">
                                                                        <span className="font-bold block mb-1">Condition / Notes:</span>
                                                                        {booking.patient_notes}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Footer */}
                                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-100">
                                                {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                                    <Button
                                                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200 shadow-none"
                                                        onClick={() => {
                                                            setSelectedBookingForUpdate(booking.id);
                                                            setIsConfirmOpen(true);
                                                        }}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Mark Completed
                                                    </Button>
                                                )}

                                                <div className="flex w-full sm:w-auto gap-3 ml-auto">
                                                    <Button
                                                        variant="primary"
                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2"
                                                        onClick={() => {
                                                            setSelectedBookingForUpdate(booking.id);
                                                            setIsPostModalOpen(true);
                                                        }}
                                                    >
                                                        <Activity className="w-4 h-4" />
                                                        Post Update
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2"
                                                        onClick={() => {
                                                            setSelectedBookingForView(booking);
                                                            setIsViewModalOpen(true);
                                                        }}
                                                    >
                                                        <Clock className="w-4 h-4" />
                                                        History
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => handleMarkCompleted(selectedBookingForUpdate)}
                title="Complete Assignment"
                message="Are you sure you want to mark this task as completed? This action cannot be undone."
                confirmText="Yes, Complete"
                variant="primary"
            />

            {/* Modals */}
            < PostCareFeedModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                bookingId={selectedBookingForUpdate}
            />

            <CareFeedModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                booking={selectedBookingForView}
            />
        </div >
    );
};

export default CompanionDashboard;
