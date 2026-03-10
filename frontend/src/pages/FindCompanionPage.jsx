import React, { useState, useEffect } from 'react';
import { companionsApi } from '../api/companions';
import { Card, CardContent } from '../components/ui/Card';
import { Navbar } from '../components/layout/Navbar';

const FindCompanionPage = () => {
    const [companions, setCompanions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCompanions();
    }, []);

    const loadCompanions = async () => {
        try {
            setLoading(true);
            const data = await companionsApi.getPublicCompanions();
            setCompanions(data);
        } catch (err) {
            setError('Failed to load companions.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container mx-auto px-4 py-24">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-primary mb-4">Find a Companion</h1>
                    <p className="text-muted text-lg max-w-2xl mx-auto">
                        Connect with verified, compassionate caregivers available in your area.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                        <p className="mt-4 text-muted">Searching for companions...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-red-50 rounded-xl">
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {companions.map((companion) => (
                            <Card key={companion.id} className="hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xl mr-4">
                                                {companion.full_name[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-primary">{companion.full_name}</h3>
                                                <div className="flex items-center text-sm text-green-600">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                                    Available Now
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 my-4"></div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted">Verified ID</span>
                                        <button className="text-sm font-medium text-accent hover:text-accent/80 transition-colors">
                                            View Profile →
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {companions.length === 0 && (
                            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <p className="text-muted text-lg">No companions are currently available online.</p>
                                <p className="text-sm text-gray-400 mt-2">Please check back later.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindCompanionPage;
