import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            login(res.data.user, res.data.token);
            if (res.data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed');
        }
    };

    // Google One Tap callback
    useEffect(() => {
        const initGsi = () => {
            if (!window.google || !window.google.accounts) return;
            // Prevent multiple initializations
            if (window.__gsiInitialized) return;
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: async (res) => {
                    try {
                        const idToken = res.credential;
                        const serverRes = await axios.post('http://localhost:5000/api/auth/google', { idToken });
                        googleLogin(serverRes.data.user, serverRes.data.token);
                        if (serverRes.data.user.role === 'admin') navigate('/admin'); else navigate('/');
                    } catch (err) {
                        console.error('Google login failed', err);
                    }
                }
            });
            window.__gsiInitialized = true;
            // render the button if desired (not necessary for One Tap)
            // window.google.accounts.id.prompt();
        };

        // Try init periodically until script loads
        let tries = 0;
        const t = setInterval(() => {
            tries++;
            if (window.google?.accounts) {
                initGsi();
                clearInterval(t);
            } else if (tries > 20) {
                clearInterval(t);
            }
        }, 200);

        return () => clearInterval(t);
    }, [googleLogin, navigate]);

    return (
        <main className="flex min-h-screen">
            {/* Left Column: Visual Content (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-surface-dim overflow-hidden">
                <img alt="Gourmet Platter" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuW6MjgO9f_sPSjSSmEo40UbTBP_j0jrMCQlTCu2uUKERzGEDoZsjf-MqCw_TuD2pt9f_TAcKezWTnAmgYkwVilT0rCv-SW29wE3hXz5n8rOivtDTVV_3Fm1kUWlqofy7LO0WwKvocAisaAsOpj2KMAv4k5rqtiuhMRvZSZQJ7qUtBZvqD5Imvj_hR1YH8j9ox1EVtxbthRvgup4L7IGbi0YoF_EJCgUjaKWeuhZmid_XckB3i0E6U7ao5TxOgTThE1eiMmzGs9A8i"/>
                {/* Glass Overlay for Branding */}
                <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent flex flex-col justify-end p-margin-desktop">
                    <div className="glass-effect p-10 rounded-[32px] max-w-xl">
                        <h1 className="font-display-lg text-display-lg text-primary mb-4 leading-tight">
                            Experience the Art of <br/>Gourmet Delivery.
                        </h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
                            Effortless technology meets culinary craft. From local hidden gems to world-class dining, curated for your doorstep.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiOsHi-yt_oVA5dTHHH9FcraEpKR28PMUACxO8yCB_M9x2DZmU2j36-qZeR8DbH4zKVsMI1OKMsOWZDmL2RZqHhFrRgvbD9FFSZgkoQCbUzTsv_VVo-gi12F6nLB4pqh9LmMe5bo-PM2gQghLvhmFtZ-bsSf80EGQnOHpuf0Mn-JCT4y0MvZysCQv9oIHjA0KNwn1jvUwG76OiE4Ixj7DfnOMix--B6u-ec5oI-s-TUMitv7dyVztHweSQcNO6AVug_tlRhfjEQb2L"/>
                                <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBycRgcJj8oefnYWA5ZiDLzoORDtZ3B4dORpGbwg6bZsPhNe-5ZbjaH6BSkf0josvm1Sp49Hr2sRx9Cb4eaWtU2xln6Us_LeurZM4mplPlRtInzISesyJQe7WImYnGvbHCzE7eBjFtK466M-Ym-DJrBRh9YmVxp5YPIQXoqAzvfGVIGMQWvf24cFYEKmW5qul6fFA-CUVr5GpC317qpY5rHfrbPOZgDtajTScYVc0xUVSw0mHcEEXC18HIrXxNw5jxWPLzXsSF0gS9u"/>
                                <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjG0p0iC2fYVtQWwMre9ZGtNaZX3bv4hHcOeX50ku-nvIxQbogpUrDsIzQCZ_NSjzMmQCWshOmQbAyZUqbbbr7QeaGXaV9Ixe4tn9b43kevSe1zbYGtsh4Nsibv_IwuslTx4k_rpGSmOAmKeG3bvYcU5BnMsGRD4Lsyf8qstAxwQDfxsiNU7QlvA2QMBTiaz5XTBVEBQcrKPRq42FANG0BzoY21gD0jBedD6k94Z8Rg0cdIvbvSfLXRtHxvX41NPnwUkUjWSIw0UWi"/>
                            </div>
                            <span className="font-label-md text-label-md text-on-surface-variant">Joined by 10k+ gourmet enthusiasts</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Authentication Canvas */}
            <div className="w-full lg:w-1/2 flex flex-col px-6 md:px-12 lg:px-24 py-12 bg-surface">
                {/* Mobile Header Only */}
                <div className="lg:hidden mb-12">
                    <Link to="/" className="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tighter">FlavorDash</Link>
                </div>

                {/* Desktop Header Branding Anchor */}
                <div className="hidden lg:flex items-center justify-between mb-24">
                    <Link to="/" className="font-headline-sm text-headline-sm text-primary tracking-tighter">FlavorDash</Link>
                    <Link to="/help" className="font-label-md text-label-md text-secondary hover:text-primary transition-colors duration-200">Help Center</Link>
                </div>

                <div className="max-w-md w-full mx-auto flex flex-col justify-center flex-grow">
                    <div className="mb-10">
                        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Welcome Back</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant">Sign in to your account to continue your culinary journey.</p>
                    </div>

                    {/* Social Authentication */}
                    <div className="flex flex-col gap-4 mb-8">
                        <button onClick={async () => {
                                if (window.google?.accounts) {
                                    window.google.accounts.id.prompt();
                                } else {
                                    console.warn('Google Identity Services not loaded');
                                }
                            }} className="w-full h-[56px] flex items-center justify-center gap-3 border border-outline-variant bg-white hover:bg-surface-container transition-all duration-200 rounded-xl active:scale-[0.98]">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>
                            <span className="font-label-md text-label-md text-on-surface">Continue with Google</span>
                        </button>

                        <div className="flex items-center gap-4 my-2">
                            <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
                            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">or email</span>
                            <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
                        </div>
                    </div>

                    {/* Main Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="font-label-md text-label-md text-on-surface-variant px-1" htmlFor="email">Email Address</label>
                            <div className="relative group">
                                <input 
                                    className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary outline-none px-4 py-3 text-on-surface font-body-md transition-all duration-300 rounded-t-lg group-hover:bg-surface-container" 
                                    id="email" 
                                    placeholder="chef@flavordash.com" 
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Password</label>
                                <Link to="#" className="font-label-sm text-label-sm text-primary hover:underline">Forgot?</Link>
                            </div>
                            <div className="relative group">
                                <input 
                                    className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary outline-none px-4 py-3 text-on-surface font-body-md transition-all duration-300 rounded-t-lg group-hover:bg-surface-container" 
                                    id="password" 
                                    placeholder="••••••••" 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant" type="button">
                                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{showPassword ? "visibility_off" : "visibility"}</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <input className="w-5 h-5 accent-primary-container rounded border-outline-variant" id="remember" type="checkbox"/>
                            <label className="font-label-md text-label-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Remember me for 30 days</label>
                        </div>

                        <button type="submit" className="w-full h-[56px] bg-primary-container text-white font-label-md text-label-md rounded-xl shadow-[0px_8px_24px_rgba(255,107,0,0.2)] hover:shadow-[0px_12px_32px_rgba(255,107,0,0.3)] transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-2">
                            Sign In
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>arrow_forward</span>
                        </button>
                    </form>

                    <p className="mt-12 text-center font-body-md text-body-md text-on-surface-variant">
                        New to FlavorDash?{' '}
                        <Link to="/register" className="text-primary font-bold hover:underline underline-offset-4">Create an account</Link>
                    </p>
                </div>

                {/* Minimal Footer */}
                <footer className="mt-auto pt-12 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="font-label-sm text-label-sm text-secondary">© 2024 FlavorDash. Crafted for connoisseurs.</p>
                    <div className="flex gap-6">
                        <Link to="#" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Privacy</Link>
                        <Link to="#" className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors">Terms</Link>
                        <div className="flex gap-2 items-center">
                            <span className="material-symbols-outlined text-[16px] text-secondary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>language</span>
                            <span className="font-label-sm text-label-sm text-secondary">English (US)</span>
                        </div>
                    </div>
                </footer>
            </div>
        </main>
    );
};

export default Login;
