import React, { useState, useEffect } from 'react';
import { complaintsApi } from '../../api/complaints';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { AlertCircle, CheckCircle, MessageSquare, Search, Filter } from 'lucide-react';

const ComplaintsPage = () => {
    const { success, error: toastError } = useToast();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // all, open, resolved
    const [replyingTo, setReplyingTo] = useState(null); // id of complaint being replied to
    const [replyText, setReplyText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        loadComplaints();
    }, [page]);

    const loadComplaints = async () => {
        try {
            setLoading(true);
            const data = await complaintsApi.getAll(page, ITEMS_PER_PAGE);
            setComplaints(data.items || []);
            setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE));
        } catch (err) {
            console.error(err);
            toastError("Failed to load complaints");
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id, currentResponse) => {
        try {
            // If resolving without a new reply, keep existing response or set default
            const responseText = replyText || currentResponse || "Issue resolved.";

            await complaintsApi.updateStatus(id, {
                status: 'resolved',
                admin_response: responseText
            });

            success("Complaint marked as resolved");
            setReplyingTo(null);
            setReplyText('');
            loadComplaints();
        } catch (err) {
            toastError("Failed to update complaint");
        }
    };

    const handleReply = async (id) => {
        if (!replyText.trim()) return;

        try {
            await complaintsApi.updateStatus(id, {
                status: 'resolved', // Auto-resolve on reply? Or keep open? usually reply resolves or waits. Let's assume reply resolves for now or keeps open. Schema says status is separate. 
                // Let's just update response and keep status as is, OR defaulting to resolved if that's the workflow. 
                // The prompt implied "reply and close". So I'll default to resolved.
                status: 'resolved',
                admin_response: replyText
            });

            success("Reply sent and complaint resolved");
            setReplyingTo(null);
            setReplyText('');
            loadComplaints();
        } catch (err) {
            toastError("Failed to send reply");
        }
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Loading complaints...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Complaints & Issues</h1>
                    <p className="text-gray-500">Manage and resolve user reported issues</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredComplaints.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            No complaints found matching your filters.
                        </CardContent>
                    </Card>
                ) : (
                    filteredComplaints.map((complaint) => (
                        <Card key={complaint.id} className={`transition-all ${complaint.status === 'open' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-emerald-500'}`}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${complaint.status === 'open' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    }`}>
                                                    {complaint.status}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    ID: {complaint.id.slice(0, 8)}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    • {new Date(complaint.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{complaint.title}</h3>

                                        {/* Detailed Context Info */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-3 rounded-lg border border-gray-100 text-sm mb-3">
                                            <div>
                                                <span className="block text-xs text-gray-400 uppercase">Service</span>
                                                <span className="font-medium text-gray-700">{complaint.service_name}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-gray-400 uppercase">NRI User</span>
                                                <span className="font-medium text-gray-700">{complaint.nri_name}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-gray-400 uppercase">Patient</span>
                                                <span className="font-medium text-gray-700">{complaint.patient_name || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-gray-400 uppercase">Assigned Companion</span>
                                                <span className="font-medium text-gray-700">{complaint.companion_name || 'None'}</span>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm leading-relaxed">
                                            {complaint.description}
                                        </div>


                                        {complaint.admin_response && (
                                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                                    <span className="text-xs font-bold text-blue-800 uppercase">Our Response</span>
                                                </div>
                                                <p className="text-sm text-blue-900">{complaint.admin_response}</p>
                                            </div>
                                        )}

                                        {replyingTo === complaint.id && (
                                            <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                                                <textarea
                                                    placeholder="Type your response here..."
                                                    rows={3}
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setReplyingTo(null);
                                                            setReplyText('');
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleResolve(complaint.id)}
                                                    >
                                                        Send Reply & Resolve
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {complaint.status === 'open' && !replyingTo && (
                                        <div className="flex flex-col justify-start pt-2">
                                            <Button
                                                onClick={() => setReplyingTo(complaint.id)}
                                                className="whitespace-nowrap bg-zinc-900 text-white hover:bg-zinc-800"
                                            >
                                                Reply to User
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
            {totalPages > 1 && (
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
            )}
        </div >
    );
};

export default ComplaintsPage;
