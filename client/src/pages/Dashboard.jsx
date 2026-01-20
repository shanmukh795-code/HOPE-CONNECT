import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { DollarSign, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ total: 0, count: 0 });
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:3000/api/donations/my-history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(res.data);

                // Calculate stats
                const total = res.data.reduce((acc, curr) => acc + curr.amount, 0);
                setStats({ total, count: res.data.length });
            } catch (error) {
                console.error(error);
                if (error.response?.status === 401) navigate('/login');
            }
        };

        fetchHistory();
    }, [navigate]);

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900">Dashboard</h1>
                        <p className="text-stone-600 mt-1">Welcome back, {user.name}. Here's your impact overview.</p>
                    </div>
                    <Button onClick={() => navigate('/donate')} className="shadow-lg shadow-primary-500/30">
                        Make a New Donation
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <Card className="p-6 border-l-4 border-l-primary-500">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-100 text-primary-600 rounded-full">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-stone-500">Total Donated</p>
                                <p className="text-2xl font-bold text-primary-900">${stats.total.toLocaleString()}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 border-l-4 border-l-secondary-400">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-secondary-100 text-secondary-600 rounded-full">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-stone-500">Donations Count</p>
                                <p className="text-2xl font-bold text-stone-900">{stats.count}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 border-l-4 border-l-blue-400">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-stone-500">Last Donation</p>
                                <p className="text-lg font-bold text-stone-900">
                                    {history.length > 0 ? new Date(history[0].createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="mb-4">
                    <h2 className="text-xl font-bold text-primary-900">Donation History</h2>
                </div>

                <Card className="overflow-hidden">
                    {history.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto h-24 w-24 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                                <DollarSign className="h-10 w-10 text-stone-400" />
                            </div>
                            <h3 className="text-lg font-medium text-stone-900">No donations yet</h3>
                            <p className="mt-1 text-stone-500 max-w-sm mx-auto">Your journey of giving starts with a single step. Make your first donation today.</p>
                            <div className="mt-6">
                                <Button onClick={() => navigate('/donate')} variant="outline">Donate Now</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-stone-200">
                                <thead className="bg-stone-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Currency</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-stone-200">
                                    {history.map((donation) => (
                                        <tr key={donation.id} className="hover:bg-stone-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">
                                                {new Date(donation.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-700">
                                                ${donation.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500 uppercase">
                                                {donation.currency}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${donation.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                                        donation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {donation.status.toLowerCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <a href="#" className="text-primary-600 hover:text-primary-900">View</a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </Layout>
    );
};

export default Dashboard;
