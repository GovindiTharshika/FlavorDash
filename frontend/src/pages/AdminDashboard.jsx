import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AVATAR_COLORS = [
    'bg-primary-fixed text-on-primary-fixed',
    'bg-secondary-fixed text-on-secondary-fixed',
    'bg-tertiary-fixed text-on-tertiary-fixed',
];

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');
};

const formatItems = (items = []) => {
    if (!items.length) return '—';
    const summary = items.map(item => `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}`).join(', ');
    return summary.length > 36 ? `${summary.slice(0, 36)}...` : summary;
};

const paymentBadge = (status) => {
    if (status === 'paid') return 'bg-green-100 text-green-700';
    if (status === 'failed') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
};

const statusDot = (status) => {
    if (status === 'preparing') return 'bg-blue-500';
    if (status === 'completed') return 'bg-green-500';
    return 'bg-surface-variant';
};

const statusLabel = (status) => {
    if (status === 'preparing') return 'Preparing';
    if (status === 'completed') return 'Completed';
    return 'Received';
};

const POLL_INTERVAL_MS = 5000;

const InventoryRow = ({ item, status, onSave }) => {
    const [stock, setStock] = useState(String(item.stock_quantity ?? 0));
    const [threshold, setThreshold] = useState(String(item.low_stock_threshold ?? 10));

    useEffect(() => {
        setStock(String(item.stock_quantity ?? 0));
        setThreshold(String(item.low_stock_threshold ?? 10));
    }, [item.stock_quantity, item.low_stock_threshold]);

    return (
        <tr className="hover:bg-surface-container-lowest/50">
            <td className="px-4 sm:px-8 py-4">
                <div className="flex items-center gap-3">
                    <img src={item.image_url || '/food-placeholder.svg'} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-label-md">{item.name}</span>
                </div>
            </td>
            <td className="px-4 sm:px-8 py-4 text-on-surface-variant">{item.category}</td>
            <td className="px-4 sm:px-8 py-4">
                <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-20 bg-surface-container border-none rounded-lg px-2 py-1 text-label-sm"
                />
            </td>
            <td className="px-4 sm:px-8 py-4">
                <input
                    type="number"
                    min="0"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-20 bg-surface-container border-none rounded-lg px-2 py-1 text-label-sm"
                />
            </td>
            <td className="px-4 sm:px-8 py-4">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${status.className}`}>
                    {status.label}
                </span>
            </td>
            <td className="px-4 sm:px-8 py-4">
                <button
                    type="button"
                    onClick={() => onSave(item.id, Number(stock), Number(threshold))}
                    className="text-primary font-label-md hover:underline"
                >
                    Save
                </button>
            </td>
        </tr>
    );
};

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeView, setActiveView] = useState('dashboard');
    const [orderFilter, setOrderFilter] = useState('all');
    const [showMenuForm, setShowMenuForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('');
    const [stockQuantity, setStockQuantity] = useState('50');
    const [lowStockThreshold, setLowStockThreshold] = useState('10');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pollRef = useRef(null);

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setIsRefreshing(true);
        setIsSyncing(true);
        try {
            const [ordersRes, foodRes, usersRes] = await Promise.all([
                api.get('/orders'),
                api.get('/food'),
                api.get('/users'),
            ]);
            setOrders(ordersRes.data);
            setFoodItems(foodRes.data);
            setUsers(usersRes.data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error fetching admin data', err);
            if (!silent) toast.error('Failed to load dashboard data');
        } finally {
            setIsSyncing(false);
            if (!silent) setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        fetchData();

        const startPolling = () => {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    fetchData(true);
                }
            }, POLL_INTERVAL_MS);
        };

        startPolling();

        const onVisibility = () => {
            if (document.visibilityState === 'visible') {
                fetchData(true);
                startPolling();
            }
        };
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [user, navigate, fetchData]);

    const updateOrderStatus = async (id, status) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, order_status: status } : o));
        try {
            await api.put(`/orders/${id}/status`, { status });
            toast.success('Order status updated');
            fetchData(true);
        } catch (err) {
            console.error('Error updating order status', err);
            toast.error('Failed to update order status');
            fetchData(true);
        }
    };

    const handleAddFood = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/food/${editingId}`, {
                    name,
                    description,
                    price,
                    image_url: imageUrl,
                    category,
                    stock_quantity: Number(stockQuantity),
                    low_stock_threshold: Number(lowStockThreshold),
                });
                toast.success('Food item updated!');
            } else {
                await api.post('/food', {
                    name,
                    description,
                    price,
                    image_url: imageUrl,
                    category,
                    stock_quantity: Number(stockQuantity),
                    low_stock_threshold: Number(lowStockThreshold),
                });
                toast.success('Food item added!');
            }
            // reset form
            setName('');
            setDescription('');
            setPrice('');
            setImageUrl('');
            setCategory('');
            setStockQuantity('50');
            setLowStockThreshold('10');
            setShowMenuForm(false);
            setEditingId(null);
            fetchData(true);
        } catch (err) {
            console.error('Error saving food item', err);
            toast.error(editingId ? 'Error updating food item' : 'Error adding food item');
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setName(item.name || '');
        setDescription(item.description || '');
        setPrice(String(item.price || ''));
        setImageUrl(item.image_url || '');
        setCategory(item.category || '');
        setStockQuantity(String(item.stock_quantity ?? 50));
        setLowStockThreshold(String(item.low_stock_threshold ?? 10));
        setShowMenuForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setShowMenuForm(false);
        setName('');
        setDescription('');
        setPrice('');
        setImageUrl('');
        setCategory('');
        setStockQuantity('50');
        setLowStockThreshold('10');
    };

    const handleDeleteFood = async (id) => {
        try {
            await api.delete(`/food/${id}`);
            setFoodItems(prev => prev.filter(i => i.id !== id));
            fetchData(true);
            toast.success('Food item deleted!');
        } catch (err) {
            toast.error('Error deleting food item');
        }
    };

    const updateUserRole = async (id, role) => {
        try {
            await api.put(`/users/${id}/role`, { role });
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
            toast.success('User role updated');
            fetchData(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update role');
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user and all their orders?')) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
            toast.success('User deleted');
            fetchData(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const updateStock = async (id, stock_quantity, low_stock_threshold) => {
        setFoodItems(prev => prev.map(i => i.id === id ? { ...i, stock_quantity, low_stock_threshold } : i));
        try {
            await api.patch(`/food/${id}/stock`, { stock_quantity, low_stock_threshold });
            toast.success('Stock updated');
            fetchData(true);
        } catch (err) {
            toast.error('Failed to update stock');
            fetchData(true);
        }
    };

    const stockStatus = (item) => {
        const stock = Number(item.stock_quantity ?? 0);
        const threshold = Number(item.low_stock_threshold ?? 10);
        if (stock <= 0) return { label: 'Out of stock', className: 'bg-red-100 text-red-700' };
        if (stock <= threshold) return { label: 'Low stock', className: 'bg-yellow-100 text-yellow-700' };
        return { label: 'In stock', className: 'bg-green-100 text-green-700' };
    };

    const stats = useMemo(() => {
        const paidOrders = orders.filter(order => order.payment_status === 'paid');
        const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
        const activeOrders = orders.filter(order => order.order_status !== 'completed').length;
        const today = new Date().toDateString();
        const newCustomers = users.filter(
            u => u.role === 'customer' && new Date(u.created_at).toDateString() === today
        ).length;

        const itemCounts = {};
        orders.forEach(order => {
            (order.items || []).forEach(item => {
                itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
            });
        });
        const topItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0];
        const lowStockItems = foodItems.filter(item => {
            const stock = Number(item.stock_quantity ?? 0);
            const threshold = Number(item.low_stock_threshold ?? 10);
            return stock > 0 && stock <= threshold;
        }).length;
        const outOfStock = foodItems.filter(item => Number(item.stock_quantity ?? 0) <= 0).length;

        const timeSlots = [
            { label: '12:00 - 14:00', start: 12, end: 14 },
            { label: '18:00 - 20:00', start: 18, end: 20 },
            { label: '21:00 - 23:00', start: 21, end: 23 },
        ];
        const peakTimes = timeSlots.map(slot => {
            const count = orders.filter(order => {
                const hour = new Date(order.created_at).getHours();
                return hour >= slot.start && hour < slot.end;
            }).length;
            return { ...slot, count };
        });
        const peakMax = Math.max(...peakTimes.map(s => s.count), 1);
        const peakTimesWithWidth = peakTimes.map(slot => ({
            ...slot,
            width: `${Math.round((slot.count / peakMax) * 100)}%`,
        }));

        return {
            totalRevenue,
            activeOrders,
            newCustomers,
            topItem,
            lowStockItems,
            outOfStock,
            totalOrders: orders.length,
            paidOrders: paidOrders.length,
            completedOrders: orders.filter(o => o.order_status === 'completed').length,
            totalUsers: users.length,
            peakTimes: peakTimesWithWidth,
        };
    }, [orders, foodItems, users]);

    const filteredOrders = useMemo(() => {
        if (orderFilter === 'all') return orders;
        return orders.filter(order => order.order_status === orderFilter);
    }, [orders, orderFilter]);

    const navItems = [
        { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
        { id: 'orders', icon: 'receipt_long', label: 'Orders', badge: stats.activeOrders },
        { id: 'menu', icon: 'restaurant_menu', label: 'Menu', badge: foodItems.length },
        { id: 'inventory', icon: 'inventory_2', label: 'Inventory', badge: stats.lowStockItems + stats.outOfStock },
        { id: 'users', icon: 'group', label: 'Users', badge: stats.totalUsers },
        { id: 'analytics', icon: 'leaderboard', label: 'Analytics' },
    ];

    const renderOrdersTable = () => (
        <section className="lg:col-span-3 bg-surface-container-lowest rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)] overflow-hidden">
            <div className="px-4 sm:px-8 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-surface-container">
                <h4 className="font-headline-sm text-headline-sm">Recent Orders</h4>
                <div className="flex gap-2">
                    {['all', 'pending', 'preparing'].map(filter => (
                        <button
                            key={filter}
                            type="button"
                            onClick={() => setOrderFilter(filter)}
                            className={`px-3 py-1 rounded-full text-label-sm capitalize transition-colors ${
                                orderFilter === filter
                                    ? 'bg-surface-container text-on-surface-variant'
                                    : 'text-on-surface-variant hover:bg-surface-variant'
                            }`}
                        >
                            {filter === 'all' ? 'All' : filter}
                        </button>
                    ))}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-low/50">
                            <th className="px-4 sm:px-8 py-4 font-label-md text-label-md text-on-surface-variant">Order ID</th>
                            <th className="px-4 sm:px-8 py-4 font-label-md text-label-md text-on-surface-variant">Customer</th>
                            <th className="px-4 sm:px-8 py-4 font-label-md text-label-md text-on-surface-variant">Items</th>
                            <th className="px-4 sm:px-8 py-4 font-label-md text-label-md text-on-surface-variant">Total</th>
                            <th className="px-4 sm:px-8 py-4 font-label-md text-label-md text-on-surface-variant">Payment</th>
                            <th className="px-4 sm:px-8 py-4 font-label-md text-label-md text-on-surface-variant">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-8 py-12 text-center text-on-surface-variant font-body-md">
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order, index) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-surface-container-lowest/50 transition-colors cursor-pointer active:scale-[0.99]"
                                >
                                    <td className="px-4 sm:px-8 py-4 font-label-md text-label-md">#FD-{order.id}</td>
                                    <td className="px-4 sm:px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}>
                                                {getInitials(order.customer_name)}
                                            </div>
                                            <span className="font-body-md text-body-md">{order.customer_name || `User ${order.user_id}`}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-8 py-4 font-body-md text-body-md text-on-surface-variant max-w-xs">
                                        {formatItems(order.items)}
                                    </td>
                                    <td className="px-4 sm:px-8 py-4 font-bold text-body-md">
                                        Rs. {Number(order.total_amount || 0).toFixed(2)}
                                    </td>
                                    <td className="px-4 sm:px-8 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${paymentBadge(order.payment_status)}`}>
                                            {order.payment_status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 min-w-[110px]">
                                                <span className={`w-2 h-2 rounded-full ${statusDot(order.order_status)}`} />
                                                <span className="font-label-md text-label-md capitalize">{statusLabel(order.order_status)}</span>
                                            </div>
                                            <select
                                                className="text-label-sm bg-surface-container border-none rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary-container outline-none"
                                                value={order.order_status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="preparing">Preparing</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-6 text-center border-t border-surface-container">
                <button
                    type="button"
                    onClick={() => setActiveView('orders')}
                    className="text-primary font-bold text-label-md hover:underline"
                >
                    View All Orders
                </button>
            </div>
        </section>
    );

    const renderSidebar = () => (
        <>
            {sidebarOpen && (
                <button
                    type="button"
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                />
            )}
            <aside className={`h-screen w-64 fixed left-0 top-0 bg-surface-container flex flex-col p-4 space-y-4 z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="mb-4 lg:mb-8 px-2 flex items-start justify-between gap-2">
                <div>
                    <h1 className="font-headline-sm text-headline-sm text-primary">FlavorDash Admin</h1>
                    <p className="font-label-md text-label-md text-on-surface-variant">Management Portal</p>
                </div>
                <button type="button" className="lg:hidden p-1 text-on-surface-variant" onClick={() => setSidebarOpen(false)} aria-label="Close">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                            activeView === item.id
                                ? 'bg-primary-container text-on-primary-container font-bold'
                                : 'text-on-surface-variant hover:bg-surface-variant'
                        }`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="font-label-md text-label-md flex-1 text-left">{item.label}</span>
                        {item.badge > 0 && (
                            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                                {item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
            <div className="pt-4 border-t border-outline-variant/30">
                <button
                    type="button"
                    onClick={() => { setActiveView('menu'); setShowMenuForm(true); }}
                    className="w-full flex items-center justify-center gap-2 bg-primary py-3 rounded-xl text-on-primary font-bold shadow-[0px_8px_24px_rgba(255,107,0,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined">add</span>
                    <span className="font-label-md text-label-md">New Listing</span>
                </button>
                <div className="mt-6 flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full border-2 border-primary/20 bg-primary-fixed flex items-center justify-center font-bold text-on-primary-fixed text-sm">
                        {getInitials(user?.name)}
                    </div>
                    <div>
                        <p className="font-label-md text-label-md leading-none">{user?.name || 'Admin'}</p>
                        <p className="text-[11px] text-on-surface-variant">General Manager</p>
                    </div>
                </div>
            </div>
        </aside>
        </>
    );

    const renderMenuSection = () => (
        <div className="space-y-stack-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h3 className="font-headline-sm text-headline-sm">Menu Management</h3>
                <button
                    type="button"
                    onClick={() => setShowMenuForm(prev => !prev)}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-[0px_8px_24px_rgba(255,107,0,0.2)] hover:scale-[1.02] transition-all w-full sm:w-auto"
                >
                    <span className="material-symbols-outlined">edit</span>
                    {showMenuForm ? 'Hide Form' : 'Add Menu Item'}
                </button>
            </div>

                {showMenuForm && (
                <form onSubmit={handleAddFood} className="bg-surface-container-lowest p-8 rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)] grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
                    <input className="bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} required />
                    <input className="bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none md:col-span-2" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
                    <input className="bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none" type="number" step="0.01" placeholder="Price (Rs.)" value={price} onChange={e => setPrice(e.target.value)} required />
                    <input className="bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none" placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required />
                    <input className="bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none" type="number" min="0" placeholder="Stock quantity" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} required />
                    <input className="bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none" type="number" min="0" placeholder="Low stock alert at" value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} required />
                    <div className="md:col-span-2 flex gap-3">
                        <button type="submit" className="flex-1 bg-primary-container text-on-primary-container py-3 rounded-xl font-label-md">{editingId ? 'Update Item' : 'Save Item'}</button>
                        {editingId && (
                            <button type="button" onClick={cancelEdit} className="flex-1 bg-surface-container text-on-surface py-3 rounded-xl font-label-md">Cancel</button>
                        )}
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {foodItems.map(item => (
                    <div key={item.id} className="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)] flex justify-between items-center gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <img
                                src={item.image_url || '/food-placeholder.svg'}
                                alt={item.name}
                                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                                <h4 className="font-title-lg text-title-lg truncate">{item.name}</h4>
                                <p className="text-on-surface-variant text-body-md">{item.category}</p>
                                <p className="font-bold text-primary">Rs. {Number(item.price).toFixed(2)}</p>
                                <p className={`text-label-sm mt-1 ${Number(item.stock_quantity ?? 0) <= 0 ? 'text-red-600' : Number(item.stock_quantity ?? 0) <= Number(item.low_stock_threshold ?? 10) ? 'text-yellow-700' : 'text-green-700'}`}>
                                    Stock: {item.stock_quantity ?? 0}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={() => startEdit(item)}
                                className="px-4 py-2 border-2 border-on-surface rounded-xl font-label-md hover:bg-surface-variant transition-colors flex-shrink-0"
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteFood(item.id)}
                                className="px-4 py-2 border-2 border-primary text-primary rounded-xl font-label-md hover:bg-primary-fixed transition-colors flex-shrink-0"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                {foodItems.length === 0 && (
                    <p className="text-on-surface-variant font-body-md">No menu items found.</p>
                )}
            </div>
        </div>
    );

    const renderUsersSection = () => (
        <section className="bg-surface-container-lowest rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)] overflow-hidden">
            <div className="px-8 py-6 border-b border-surface-container">
                <h3 className="font-headline-sm text-headline-sm">User Management</h3>
                <p className="font-body-md text-on-surface-variant">{users.length} registered users</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-surface-container-low/50">
                            <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">User</th>
                            <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Contact</th>
                            <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Orders</th>
                            <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Spent</th>
                            <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Role</th>
                            <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {users.map((u, index) => (
                            <tr key={u.id} className="hover:bg-surface-container-lowest/50">
                                <td className="px-4 sm:px-8 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}>
                                            {getInitials(u.name)}
                                        </div>
                                        <div>
                                            <p className="font-label-md">{u.name}</p>
                                            <p className="text-label-sm text-on-surface-variant">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 sm:px-8 py-4 text-body-md text-on-surface-variant">
                                    <p>{u.phone || '—'}</p>
                                    <p className="text-label-sm">{u.city || ''}</p>
                                </td>
                                <td className="px-4 sm:px-8 py-4">{u.order_count || 0}</td>
                                <td className="px-4 sm:px-8 py-4 font-bold">Rs. {Number(u.total_spent || 0).toFixed(2)}</td>
                                <td className="px-4 sm:px-8 py-4">
                                    <select
                                        className="bg-surface-container border-none rounded-lg px-2 py-1 text-label-sm capitalize"
                                        value={u.role}
                                        onChange={(e) => updateUserRole(u.id, e.target.value)}
                                        disabled={Number(u.id) === Number(user?.id)}
                                    >
                                        <option value="customer">customer</option>
                                        <option value="admin">admin</option>
                                    </select>
                                </td>
                                <td className="px-4 sm:px-8 py-4">
                                    <button
                                        type="button"
                                        onClick={() => deleteUser(u.id)}
                                        disabled={Number(u.id) === Number(user?.id)}
                                        className="text-error font-label-md hover:underline disabled:opacity-40"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );

    const renderInventorySection = () => (
        <div className="space-y-stack-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)]">
                    <p className="font-label-md text-on-surface-variant">Total SKUs</p>
                    <h3 className="font-display-lg text-[32px]">{foodItems.length}</h3>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)]">
                    <p className="font-label-md text-on-surface-variant">Low Stock Items</p>
                    <h3 className="font-display-lg text-[32px] text-yellow-700">{stats.lowStockItems}</h3>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)]">
                    <p className="font-label-md text-on-surface-variant">Out of Stock</p>
                    <h3 className="font-display-lg text-[32px] text-red-700">{stats.outOfStock}</h3>
                </div>
            </div>

            <section className="bg-surface-container-lowest rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)] overflow-hidden">
                <div className="px-4 sm:px-8 py-6 border-b border-surface-container">
                    <h3 className="font-headline-sm text-headline-sm">Product Inventory</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-surface-container-low/50">
                                <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Product</th>
                                <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Category</th>
                                <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Stock</th>
                                <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Alert At</th>
                                <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Status</th>
                                <th className="px-4 sm:px-8 py-4 font-label-md text-on-surface-variant">Update</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container">
                            {foodItems.map(item => {
                                const status = stockStatus(item);
                                return (
                                    <InventoryRow key={item.id} item={item} status={status} onSave={updateStock} />
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );

    const topFood = stats.topItem ? foodItems.find(item => item.name === stats.topItem[0]) : foodItems[0];

    return (
        <div className="flex min-h-screen text-on-surface bg-background">
            {renderSidebar()}

            <main className="flex-1 lg:ml-64 px-4 sm:px-6 md:px-10 lg:px-margin-desktop max-w-container-max mx-auto w-full space-y-stack-lg pt-20 lg:pt-8 pb-24 lg:pb-20">
                {/* Mobile admin top bar */}
                <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-surface-container border-b border-outline-variant/30 px-4 py-3 flex items-center gap-3">
                    <button type="button" onClick={() => setSidebarOpen(true)} className="p-1 text-primary" aria-label="Open menu">
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <span className="font-label-md text-label-md text-primary truncate flex-1">FlavorDash Admin</span>
                    <button type="button" onClick={() => fetchData()} className="p-1 text-on-surface-variant" aria-label="Refresh">
                        <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
                    </button>
                </div>

                <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4">
                    <div>
                        <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
                            {activeView === 'dashboard' && 'Dashboard Overview'}
                            {activeView === 'orders' && 'Orders'}
                            {activeView === 'menu' && 'Menu'}
                            {activeView === 'inventory' && 'Product Inventory'}
                            {activeView === 'users' && 'User Management'}
                            {activeView === 'analytics' && 'Analytics'}
                        </h2>
                        <p className="font-body-lg text-body-lg text-on-surface-variant">
                            Welcome back. Here is what&apos;s happening with FlavorDash today.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                            <span className="text-label-sm text-on-surface-variant">
                                Live sync {lastUpdated ? `· updated ${lastUpdated.toLocaleTimeString()}` : ''}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => fetchData()}
                            disabled={isRefreshing}
                            className="hidden sm:flex items-center gap-2 px-4 sm:px-6 py-3 border-2 border-on-surface rounded-xl font-label-md text-label-md hover:bg-surface-container transition-colors disabled:opacity-60"
                        >
                            <span className={`material-symbols-outlined ${isRefreshing ? 'animate-spin' : ''}`}>refresh</span>
                            {isRefreshing ? 'Syncing...' : 'Refresh'}
                        </button>
                        {activeView === 'dashboard' && (
                            <button
                                type="button"
                                onClick={() => { setActiveView('menu'); setShowMenuForm(true); }}
                                className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-[0px_8px_24px_rgba(255,107,0,0.2)] hover:scale-[1.02] transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                <span className="sm:hidden">Menu</span>
                                <span className="hidden sm:inline">Manage Menu Items</span>
                            </button>
                        )}
                    </div>
                </header>

                {(activeView === 'dashboard' || activeView === 'analytics') && (
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                        <div className="bg-surface-container-lowest p-8 rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)] group hover:bg-primary-fixed transition-colors duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-on-primary/20">
                                    <span className="material-symbols-outlined text-primary group-hover:text-on-primary-fixed">payments</span>
                                </div>
                                <span className="text-green-600 font-bold text-label-sm flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                    Live
                                </span>
                            </div>
                            <p className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-primary-fixed-variant">Total Revenue</p>
                            <h3 className="font-display-lg text-[32px] text-on-surface group-hover:text-on-primary-fixed">
                                Rs. {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                        </div>

                        <div className="bg-surface-container-lowest p-8 rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)] group hover:bg-secondary-container transition-colors duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-on-secondary/20">
                                    <span className="material-symbols-outlined text-secondary group-hover:text-on-secondary-fixed">shopping_bag</span>
                                </div>
                                <span className="text-on-surface-variant font-bold text-label-sm">In Progress</span>
                            </div>
                            <p className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-secondary-fixed-variant">Active Orders</p>
                            <h3 className="font-display-lg text-[32px] text-on-surface group-hover:text-on-secondary-fixed">{stats.activeOrders}</h3>
                        </div>

                        <div className="bg-surface-container-lowest p-8 rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)] group hover:bg-tertiary-fixed transition-colors duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-tertiary/10 rounded-lg group-hover:bg-on-tertiary/20">
                                    <span className="material-symbols-outlined text-tertiary group-hover:text-on-tertiary-fixed">person_add</span>
                                </div>
                                <span className="text-primary font-bold text-label-sm">New Today</span>
                            </div>
                            <p className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-tertiary-fixed-variant">New Customers</p>
                            <h3 className="font-display-lg text-[32px] text-on-surface group-hover:text-on-tertiary-fixed">{stats.newCustomers}</h3>
                        </div>
                    </section>
                )}

                {activeView === 'menu' && renderMenuSection()}

                {activeView === 'users' && renderUsersSection()}

                {activeView === 'inventory' && renderInventorySection()}

                {(activeView === 'dashboard' || activeView === 'orders') && (
                    <div className={`grid grid-cols-1 ${activeView === 'dashboard' ? 'lg:grid-cols-4' : ''} gap-gutter`}>
                        <div className={activeView === 'dashboard' ? 'lg:col-span-3' : ''}>
                            {renderOrdersTable()}
                        </div>

                        {activeView === 'dashboard' && (
                            <aside className="space-y-stack-md">
                                <div className="bg-surface-container-highest p-6 rounded-[24px] space-y-4">
                                    <h4 className="font-headline-sm text-[20px]">Menu Health</h4>
                                    <p className="font-body-md text-body-md text-on-surface-variant">
                                        Top performer:{' '}
                                        <span className="font-bold text-on-surface">
                                            {stats.topItem ? stats.topItem[0] : 'No data yet'}
                                        </span>
                                    </p>
                                    <div className="relative h-40 w-full rounded-xl overflow-hidden mt-4">
                                        <img
                                            alt="Top menu item"
                                            className="absolute inset-0 w-full h-full object-cover"
                                            src={topFood?.image_url || '/food-placeholder.svg'}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                                            <span className="text-white font-bold text-label-sm">
                                                {stats.topItem ? `${stats.topItem[1]} orders` : 'Add menu items'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/85 backdrop-blur-md p-6 rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)] border border-white/50">
                                    <h4 className="font-label-md text-label-md text-on-surface-variant mb-4">Peak Order Times</h4>
                                    <div className="space-y-3">
                                        {stats.peakTimes.map(slot => (
                                            <div key={slot.label} className="flex justify-between items-center gap-4">
                                                <span className="text-label-sm whitespace-nowrap">{slot.label}</span>
                                                <div className="flex items-center gap-2 flex-1 justify-end">
                                                    <span className="text-label-sm text-on-surface-variant">{slot.count}</span>
                                                    <div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
                                                        <div className="bg-primary h-full transition-all duration-500" style={{ width: slot.width }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </aside>
                        )}
                    </div>
                )}

                {activeView === 'analytics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
                        <div className="bg-surface-container-lowest p-8 rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)]">
                            <h4 className="font-headline-sm text-headline-sm mb-4">Order Breakdown</h4>
                            <div className="space-y-3">
                                <p className="font-body-md">Total orders: <strong>{stats.totalOrders}</strong></p>
                                <p className="font-body-md">Completed: <strong>{stats.completedOrders}</strong></p>
                                <p className="font-body-md">Paid orders: <strong>{stats.paidOrders}</strong></p>
                                <p className="font-body-md">Menu items: <strong>{foodItems.length}</strong></p>
                                <p className="font-body-md">Registered users: <strong>{stats.totalUsers}</strong></p>
                                <p className="font-body-md">Low stock alerts: <strong>{stats.lowStockItems}</strong></p>
                                <p className="font-body-md">Out of stock: <strong>{stats.outOfStock}</strong></p>
                            </div>
                        </div>
                        <div className="bg-surface-container-lowest p-8 rounded-[24px] shadow-[0px_4px_20px_rgba(28,28,26,0.04)]">
                            <h4 className="font-headline-sm text-headline-sm mb-4">Top Ordered Items</h4>
                            <ul className="space-y-2">
                                {Object.entries(
                                    orders.reduce((acc, order) => {
                                        (order.items || []).forEach(item => {
                                            acc[item.name] = (acc[item.name] || 0) + item.quantity;
                                        });
                                        return acc;
                                    }, {})
                                )
                                    .sort((a, b) => b[1] - a[1])
                                    .slice(0, 5)
                                    .map(([itemName, count]) => (
                                        <li key={itemName} className="flex justify-between font-body-md">
                                            <span>{itemName}</span>
                                            <strong>{count}</strong>
                                        </li>
                                    ))}
                                {orders.length === 0 && <li className="text-on-surface-variant">No order data yet.</li>}
                            </ul>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
