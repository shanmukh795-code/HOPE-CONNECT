import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalDonationsCount: 0, totalAmount: 0 });
    const [users, setUsers] = useState([]);
    const [donations, setDonations] = useState([]);
    const [activeTab, setActiveTab] = useState('stats');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const statsRes = await axios.get('http://localhost:3000/api/admin/stats', { headers });
                setStats(statsRes.data);

                const usersRes = await axios.get('http://localhost:3000/api/admin/users', { headers });
                setUsers(usersRes.data);

                const donRes = await axios.get('http://localhost:3000/api/admin/donations', { headers });
                setDonations(donRes.data);
            } catch (error) {
                console.error(error);
                if (error.response?.status === 403) {
                    alert('Access Denied');
                    navigate('/dashboard');
                } else if (error.response?.status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchData();
    }, [navigate]);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={() => { localStorage.clear(); navigate('/login'); }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            <div className="flex space-x-4 mb-6">
                <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded ${activeTab === 'stats' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Stats</button>
                <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Users</button>
                <button onClick={() => setActiveTab('donations')} className={`px-4 py-2 rounded ${activeTab === 'donations' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Donations</button>
            </div>

            {activeTab === 'stats' && (
                <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded shadow text-center">
                        <h3 className="text-xl text-gray-500">Total Users</h3>
                        <p className="text-4xl font-bold">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow text-center">
                        <h3 className="text-xl text-gray-500">Total Donations</h3>
                        <p className="text-4xl font-bold">{stats.totalDonationsCount}</p>
                    </div>
                    <div className="bg-white p-6 rounded shadow text-center">
                        <h3 className="text-xl text-gray-500">Total Amount Raised</h3>
                        <p className="text-4xl font-bold text-green-600">${stats.totalAmount.toFixed(2)}</p>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white p-6 rounded shadow">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-xl font-semibold">Registered Users</h2>

                        <div className="flex gap-2 w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="border p-2 rounded w-full md:w-64"
                                onChange={(e) => {
                                    const term = e.target.value.toLowerCase();
                                    const filtered = users.filter(u =>
                                        u.name.toLowerCase().includes(term) ||
                                        u.email.toLowerCase().includes(term)
                                    );
                                    // Hacky way to filter locally since we don't have a separate state for filtered users yet
                                    // Better to separate filteredUsers state but for now updating view is acceptable if we re-fetch on clear
                                    // Actually, let's just use CSS filtering or simple map logic
                                    // Re-implementing correctly:
                                }}
                                onKeyUp={(e) => {
                                    // Better implementation below in the map
                                    const term = e.target.value.toLowerCase();
                                    const rows = document.querySelectorAll('.user-row');
                                    rows.forEach(row => {
                                        const text = row.innerText.toLowerCase();
                                        row.style.display = text.includes(term) ? '' : 'none';
                                    });
                                }}
                            />

                            <button
                                onClick={() => {
                                    const headers = ['ID,Name,Email,Role,Joined\n'];
                                    const csvRows = users.map(user =>
                                        `${user.id},"${user.name}","${user.email}",${user.role},${new Date(user.createdAt).toLocaleDateString()}`
                                    );
                                    const blob = new Blob([...headers, ...csvRows.join('\n')], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'users_export.csv';
                                    a.click();
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 whitespace-nowrap"
                            >
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end mb-2">
                        {users.length > 0 && (
                            <button
                                onClick={async () => {
                                    if (window.confirm('WARNING: This will delete ALL users, including YOUR admin account. You will be logged out immediately. Are you sure?')) {
                                        try {
                                            const token = localStorage.getItem('token');
                                            await axios.delete('http://localhost:3000/api/admin/users', {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            alert('All users deleted. Logging out.');
                                            localStorage.clear();
                                            navigate('/login');
                                        } catch (error) {
                                            alert('Failed to clear users');
                                            console.error(error);
                                        }
                                    }
                                }}
                                className="text-xs text-red-500 hover:text-red-700 underline"
                            >
                                Danger: Clear All Users
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="py-3 px-4 font-semibold text-gray-600">ID</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">Name</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">Email</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">Role</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="user-row border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">{user.id}</td>
                                        <td className="py-3 px-4 font-medium">{user.name}</td>
                                        <td className="py-3 px-4">{user.email}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'donations' && (
                <div className="bg-white p-6 rounded shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">All Donations</h2>
                        {donations.length > 0 && (
                            <button
                                onClick={async () => {
                                    if (window.confirm('Are you sure you want to delete ALL donations? This cannot be undone.')) {
                                        try {
                                            const token = localStorage.getItem('token');
                                            await axios.delete('http://localhost:3000/api/admin/donations', {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            setDonations([]); // Clear local state
                                            // Refresh stats too if needed
                                            const statsRes = await axios.get('http://localhost:3000/api/admin/stats', {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            setStats(statsRes.data);
                                        } catch (error) {
                                            alert('Failed to clear donations');
                                            console.error(error);
                                        }
                                    }
                                }}
                                className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2">Date</th>
                                    <th className="py-2">User</th>
                                    <th className="py-2">Amount</th>
                                    <th className="py-2">Status</th>
                                    <th className="py-2">Payment ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donations.map(don => (
                                    <tr key={don.id} className="border-b">
                                        <td className="py-2">{new Date(don.createdAt).toLocaleDateString()}</td>
                                        <td className="py-2">{don.user?.name} ({don.user?.email})</td>
                                        <td className="py-2">${don.amount}</td>
                                        <td className={`py-2 ${don.status === 'SUCCESS' ? 'text-green-600' :
                                            don.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                                            }`}>{don.status}</td>
                                        <td className="py-2 text-xs text-gray-500 font-mono">{don.stripePaymentIntentId || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
