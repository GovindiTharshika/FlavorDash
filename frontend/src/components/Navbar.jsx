import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    const urlQuery = new URLSearchParams(location.search).get('q') || '';

    useEffect(() => {
        setSearchInput(urlQuery);
    }, [urlQuery]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const updateCartCount = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
        };
        updateCartCount();
        window.addEventListener('storage', updateCartCount);
        window.addEventListener('cart-updated', updateCartCount);
        return () => {
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('cart-updated', updateCartCount);
        };
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const submitSearch = (e) => {
        e?.preventDefault();
        const q = searchInput.trim();
        if (q) {
            navigate(`/menu?q=${encodeURIComponent(q)}`);
        } else {
            navigate('/menu');
        }
        setMobileSearchOpen(false);
        setMobileOpen(false);
    };

    const navLinkClass = (path) =>
        `font-label-md text-label-md transition-colors duration-200 ${
            location.pathname === path
                ? 'text-primary font-bold'
                : 'text-secondary dark:text-secondary-fixed-dim hover:text-primary'
        }`;

    const mobileNavLinks = (
        <>
            <Link to="/" className={navLinkClass('/')} onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/menu" className={navLinkClass('/menu')} onClick={() => setMobileOpen(false)}>Menu</Link>
            {user?.role === 'admin' && (
                <Link to="/admin" className={navLinkClass('/admin')} onClick={() => setMobileOpen(false)}>Dashboard</Link>
            )}
            {user && user.role !== 'admin' && (
                <Link to="/profile" className={navLinkClass('/profile')} onClick={() => setMobileOpen(false)}>Profile</Link>
            )}
            <Link to="/cart" className={navLinkClass('/cart')} onClick={() => setMobileOpen(false)}>
                Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
        </>
    );

    return (
        <>
            <header className={`bg-surface/85 backdrop-blur-md dark:bg-surface-dim/85 fixed top-0 w-full z-50 border-b border-outline-variant/30 dark:border-outline/20 shadow-sm transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3 md:py-4'}`}>
                <nav className="flex justify-between items-center px-4 sm:px-6 md:px-10 lg:px-margin-desktop max-w-container-max mx-auto gap-4">
                    <div className="flex items-center gap-4 md:gap-8 min-w-0">
                        <button
                            type="button"
                            className="md:hidden p-1 -ml-1 text-primary"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open menu"
                        >
                            <span className="material-symbols-outlined text-[28px]">menu</span>
                        </button>
                        <Link to="/" className="font-display-lg text-[20px] sm:text-[24px] text-primary dark:text-primary-fixed-dim truncate">
                            FlavorDash
                        </Link>
                        <div className="hidden md:flex items-center gap-6">
                            <Link to="/" className={navLinkClass('/')}>Home</Link>
                            <Link to="/menu" className={navLinkClass('/menu')}>Menu</Link>
                            {user?.role === 'admin' && (
                                <Link to="/admin" className={navLinkClass('/admin')}>Dashboard</Link>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <form
                            onSubmit={submitSearch}
                            className={`items-center bg-surface-container-low rounded-full border border-outline-variant/30 ${
                                mobileSearchOpen ? 'flex flex-1 min-w-0 mx-1' : 'hidden md:flex'
                            } lg:flex px-3 sm:px-4 py-1.5 sm:py-2`}
                        >
                            <span className="material-symbols-outlined text-secondary mr-2 text-[20px] flex-shrink-0">search</span>
                            <input
                                className="bg-transparent border-none focus:ring-0 text-body-md font-body-md w-full md:w-28 lg:w-36 xl:w-48 outline-none min-w-0"
                                placeholder="Search dishes..."
                                type="search"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </form>
                        {!mobileSearchOpen && (
                            <button
                                type="button"
                                className="md:hidden p-1 text-secondary hover:text-primary"
                                onClick={() => setMobileSearchOpen(true)}
                                aria-label="Search"
                            >
                                <span className="material-symbols-outlined text-[24px]">search</span>
                            </button>
                        )}
                        {mobileSearchOpen && (
                            <button
                                type="button"
                                className="md:hidden p-1 text-on-surface-variant"
                                onClick={() => { setMobileSearchOpen(false); setSearchInput(urlQuery); }}
                                aria-label="Close search"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link to="/cart" className="active:scale-95 transition-transform text-primary dark:text-primary-fixed-dim relative p-1">
                                <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-primary-container text-on-primary-container text-[10px] min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full font-bold">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>
                            {user ? (
                                <>
                                    <Link to={user.role === 'admin' ? '/admin' : '/profile'} className="active:scale-95 transition-transform text-primary dark:text-primary-fixed-dim flex items-center gap-1 font-label-md p-1">
                                        <span className="material-symbols-outlined text-[24px]">account_circle</span>
                                        <span className="hidden sm:inline">{user.role === 'admin' ? 'Admin' : 'Profile'}</span>
                                    </Link>
                                    <button onClick={handleLogout} className="active:scale-95 transition-transform text-primary dark:text-primary-fixed-dim flex items-center gap-1 font-label-md p-1">
                                        <span className="material-symbols-outlined text-[24px]">logout</span>
                                        <span className="hidden sm:inline">Logout</span>
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="active:scale-95 transition-transform text-primary dark:text-primary-fixed-dim flex items-center gap-1 font-label-md p-1">
                                    <span className="material-symbols-outlined text-[24px]">account_circle</span>
                                    <span className="hidden sm:inline">Login</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close menu"
                    />
                    <aside className="absolute left-0 top-0 h-full w-[min(300px,85vw)] bg-surface shadow-2xl flex flex-col p-6 animate-[slideIn_0.2s_ease-out]">
                        <div className="flex justify-between items-center mb-8">
                            <span className="font-headline-sm text-headline-sm text-primary">Menu</span>
                            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close">
                                <span className="material-symbols-outlined text-on-surface-variant">close</span>
                            </button>
                        </div>
                        <nav className="flex flex-col gap-5 text-lg">
                            {mobileNavLinks}
                        </nav>
                        <form onSubmit={submitSearch} className="mt-6 flex items-center gap-2 bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/30">
                            <span className="material-symbols-outlined text-secondary text-[20px]">search</span>
                            <input
                                className="bg-transparent border-none focus:ring-0 text-body-md w-full outline-none"
                                placeholder="Search dishes..."
                                type="search"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </form>
                        <div className="mt-auto pt-6 border-t border-outline-variant/30">
                            {user ? (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-outline-variant font-label-md"
                                >
                                    <span className="material-symbols-outlined text-sm">logout</span>
                                    Logout
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-container text-on-primary-container font-label-md"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
};

export default Navbar;
