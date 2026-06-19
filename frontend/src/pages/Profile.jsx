import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');
};

const paymentBadge = (status) => {
    if (status === 'paid') return 'bg-green-100 text-green-700';
    if (status === 'failed') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
};

const Profile = () => {
    const { user, login, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', address: '', city: '' });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role === 'admin') {
            navigate('/admin');
            return;
        }
        loadProfile();
    }, [user, navigate]);

    const loadProfile = async () => {
        try {
            const [profileRes, ordersRes] = await Promise.all([
                api.get('/users/me'),
                api.get('/orders'),
            ]);
            setProfile(profileRes.data);
            setOrders(ordersRes.data);
            setForm({
                name: profileRes.data.name || '',
                phone: profileRes.data.phone || '',
                address: profileRes.data.address || '',
                city: profileRes.data.city || '',
            });
        } catch (err) {
            console.error(err);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/users/me', form);
            setProfile(res.data);
            const token = localStorage.getItem('token');
            login({ ...user, ...res.data }, token);
            toast.success('Profile updated!');
        } catch (err) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-on-surface-variant">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="bg-background text-on-surface min-h-screen pt-20 md:pt-28 pb-12 md:pb-20 px-4 sm:px-6 md:px-10 lg:px-margin-desktop">
            <div className="max-w-container-max mx-auto space-y-stack-lg">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="font-headline-md text-headline-md text-on-surface">My Profile</h1>
                        <p className="font-body-md text-on-surface-variant">Manage your account and view order history</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => { logout(); navigate('/login'); }}
                        className="flex items-center gap-2 px-5 py-2 border-2 border-outline-variant rounded-xl font-label-md hover:bg-surface-container transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                    <section className="lg:col-span-4 bg-surface-container-lowest p-stack-lg rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)]">
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-24 h-24 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-3xl font-bold mb-4">
                                {getInitials(profile?.name)}
                            </div>
                            <h2 className="font-headline-sm text-headline-sm">{profile?.name}</h2>
                            <p className="font-body-md text-on-surface-variant">{profile?.email}</p>
                            <span className="mt-3 px-3 py-1 bg-surface-container rounded-full text-label-sm capitalize">{profile?.role}</span>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Full Name</label>
                                <input name="name" value={form.name} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none" required />
                            </div>
                            <div>
                                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Phone</label>
                                <input name="phone" value={form.phone} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none" placeholder="+94 77 123 4567" />
                            </div>
                            <div>
                                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Address</label>
                                <input name="address" value={form.address} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none" placeholder="Street address" />
                            </div>
                            <div>
                                <label className="font-label-md text-label-md text-on-surface-variant block mb-1">City</label>
                                <input name="city" value={form.city} onChange={handleChange} className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none" placeholder="Colombo" />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-primary-container text-on-primary-container py-3 rounded-full font-label-md hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
                            >
                                {saving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </form>
                    </section>

                    <section className="lg:col-span-8 bg-surface-container-lowest rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)] overflow-hidden">
                        <div className="px-4 sm:px-8 py-6 border-b border-surface-container">
                            <h3 className="font-headline-sm text-headline-sm">Order History</h3>
                            <p className="font-body-md text-on-surface-variant">{orders.length} order(s)</p>
                        </div>
                        {orders.length === 0 ? (
                            <div className="p-8 sm:p-12 text-center">
                                <p className="text-on-surface-variant mb-4">You haven&apos;t placed any orders yet.</p>
                                <button type="button" onClick={() => navigate('/menu')} className="text-primary font-label-md hover:underline">
                                    Browse Menu
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Mobile cards */}
                                <div className="md:hidden divide-y divide-surface-container">
                                    {orders.map(order => (
                                        <div key={order.id} className="p-4 space-y-2">
                                            <div className="flex justify-between items-start gap-2">
                                                <span className="font-label-md">#FD-{order.id}</span>
                                                <span className="font-bold">Rs. {Number(order.total_amount || 0).toFixed(2)}</span>
                                            </div>
                                            <p className="text-on-surface-variant text-body-md text-sm line-clamp-2">
                                                {(order.items || []).map(i => i.name).join(', ') || '—'}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${paymentBadge(order.payment_status)}`}>
                                                    {order.payment_status}
                                                </span>
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-surface-container capitalize">
                                                    {order.order_status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Desktop table */}
                                <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left min-w-[600px]">
                                    <thead>
                                        <tr className="bg-surface-container-low/50">
                                            <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Order</th>
                                            <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Items</th>
                                            <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Total</th>
                                            <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Payment</th>
                                            <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container">
                                        {orders.map(order => (
                                            <tr key={order.id} className="hover:bg-surface-container-lowest/50">
                                                <td className="px-4 sm:px-8 py-4 font-label-md">#FD-{order.id}</td>
                                                <td className="px-4 sm:px-8 py-4 text-on-surface-variant text-body-md max-w-xs">
                                                    {(order.items || []).map(i => i.name).join(', ') || '—'}
                                                </td>
                                                <td className="px-4 sm:px-8 py-4 font-bold">Rs. {Number(order.total_amount || 0).toFixed(2)}</td>
                                                <td className="px-4 sm:px-8 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${paymentBadge(order.payment_status)}`}>
                                                        {order.payment_status}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-8 py-4 capitalize">{order.order_status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Profile;
