import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';

const Home = () => {
    const [foodItems, setFoodItems] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/food')
            .then(res => setFoodItems(res.data))
            .catch(err => console.error(err));
    }, []);

    const addToCart = (item) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find(cartItem => cartItem.food_item_id === item.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ food_item_id: item.id, name: item.name, price: Number(item.price), quantity: 1, image_url: item.image_url });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
        toast.success('Added to cart!');
    };

    return (
        <div className="bg-background text-on-surface">
            <main className="pt-20 md:pt-24">
                {/* Hero Section */}
                <section className="relative min-h-[50vh] md:min-h-[60vh] lg:min-h-[870px] flex items-center overflow-hidden px-4 sm:px-6 md:px-10 lg:px-margin-desktop">
                    <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center w-full z-10 py-8 lg:py-0">
                        <div className="space-y-stack-md md:space-y-stack-lg max-w-xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>auto_awesome</span>
                                EXQUISITE DINING AT YOUR DOORSTEP
                            </div>
                            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface leading-tight">
                                Gourmet Flavors, <br/><span className="text-primary">Delivered Fast</span>
                            </h1>
                            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                                Experience the art of culinary excellence without leaving your home. We partner with top chefs to bring Michelin-quality meals to your table in under 30 minutes.
                            </p>
                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2 md:pt-4">
                                <button className="bg-primary-container text-on-primary-container px-6 sm:px-8 py-3 sm:py-4 rounded-full font-label-md text-label-md hover:shadow-[0px_8px_24px_rgba(255,107,0,0.2)] transition-all active:scale-95 w-full sm:w-auto">
                                    Order Now
                                </button>
                                <button className="border-2 border-on-surface text-on-surface px-6 sm:px-8 py-3 sm:py-4 rounded-full font-label-md text-label-md hover:bg-surface-container transition-all active:scale-95 w-full sm:w-auto">
                                    View Menu
                                </button>
                            </div>
                        </div>
                        <div className="relative mt-6 lg:mt-0">
                            <div className="absolute -inset-4 bg-primary-fixed/20 rounded-[48px] rotate-3 blur-2xl hidden lg:block"></div>
                            <img className="relative z-10 w-full h-[240px] sm:h-[320px] lg:h-[600px] object-cover rounded-[24px] lg:rounded-[32px] shadow-2xl" alt="Gourmet Burger" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJ0JW-0dpzndAxrNqOZYDsNTTJ1Ix9TmSdufZWuzgn3pQ6_RX8c0qF2GAOhlPUYz4ecA7Q63S94PGaPMVyt9xVnZ0aY-VIFC4sW6-uFhHrTEli8CQb8Cgt32qshcfPIZKXh_vuDqR2gVhNSepjnMF6_gcJw-BX0UabdKeffygLGi8WlYtjqa1TKXdPRLtyx1qyUVT6TwkHQQg4fWMYD6YtyyUh1TEPjAA4nwRtjqDPwLBD1yKjrRg-5rnwoiG1M7kcOEWdJwX9jIzl"/>
                            <div className="absolute -bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:-bottom-8 sm:-left-8 glass-card p-4 sm:p-6 rounded-2xl shadow-xl z-20 border border-white/20 lg:animate-bounce max-w-xs">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>timer</span>
                                    </div>
                                    <div>
                                        <p className="font-label-md text-label-md">Lightning Fast</p>
                                        <p className="font-body-md text-body-md text-secondary">~18 mins delivery</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-fixed/10 -skew-x-12 translate-x-1/2"></div>
                </section>

                {/* Popular Categories */}
                <section className="py-12 md:py-24 bg-surface px-4 sm:px-6 md:px-10 lg:px-margin-desktop">
                    <div className="max-w-container-max mx-auto">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 md:mb-12">
                            <div>
                                <h2 className="font-headline-md text-headline-md text-on-surface">Explore by Category</h2>
                                <p className="text-on-surface-variant font-body-md mt-2">Curated selections from the world's finest kitchens.</p>
                            </div>
                            <button className="text-primary font-label-md hover:underline flex items-center gap-2">
                                View All <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>arrow_forward</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-gutter">
                            {/* Categories */}
                            {[
                                { icon: 'local_pizza', label: 'Pizza' },
                                { icon: 'lunch_dining', label: 'Burgers' },
                                { icon: 'cake', label: 'Desserts' },
                                { icon: 'set_meal', label: 'Sushi' },
                                { icon: 'nutrition', label: 'Healthy' },
                                { icon: 'wine_bar', label: 'Drinks' },
                            ].map((cat, idx) => (
                                <div key={idx} className="group cursor-pointer">
                                    <div className="aspect-square rounded-3xl bg-surface-container flex flex-col items-center justify-center transition-all duration-300 group-hover:bg-primary-fixed group-hover:-translate-y-2">
                                        <span className="material-symbols-outlined text-4xl text-primary mb-2" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{cat.icon}</span>
                                        <span className="font-label-md text-label-md">{cat.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trending Now / Menu Items */}
                <section className="py-12 md:py-24 bg-surface-container-low px-4 sm:px-6 md:px-10 lg:px-margin-desktop">
                    <div className="max-w-container-max mx-auto">
                        <div className="flex items-center gap-4 mb-12">
                            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>trending_up</span>
                            <h2 className="font-headline-md text-headline-md text-on-surface">Trending Now</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
                            {foodItems.map(item => (
                                <div key={item.id} className="bg-surface rounded-[24px] overflow-hidden border border-outline-variant/20 hover:shadow-lg transition-all group flex flex-col">
                                    <div className="relative h-48 overflow-hidden">
                                        <img src={item.image_url || 'https://via.placeholder.com/400x300'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                            <span className="material-symbols-outlined text-orange-400 text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>star</span>
                                            <span className="font-label-sm text-label-sm text-on-surface">4.8</span>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-surface flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-title-lg text-title-lg text-on-surface">{item.name}</h3>
                                            <span className="font-title-lg text-title-lg text-primary">Rs. {item.price}</span>
                                        </div>
                                        <p className="text-secondary font-body-md text-body-md line-clamp-2 mb-6 flex-1">{item.description}</p>
                                        <button onClick={() => addToCart(item)} className="w-full bg-on-surface text-white py-3 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-primary">
                                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>add_shopping_cart</span>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section className="py-12 md:py-24 px-4 sm:px-6 md:px-10 lg:px-margin-desktop">
                    <div className="max-w-container-max mx-auto text-center">
                        <h2 className="font-headline-md text-headline-md mb-4 text-on-surface">How It Works</h2>
                        <p className="text-on-surface-variant font-body-md max-w-2xl mx-auto mb-16">The simplest way to enjoy gourmet dining at home.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-primary-fixed text-primary flex items-center justify-center mb-6 relative">
                                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>restaurant_menu</span>
                                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</span>
                                </div>
                                <h3 className="font-headline-sm text-headline-sm mb-3">Pick Your Feast</h3>
                                <p className="text-secondary font-body-md">Browse our curated list of elite restaurants and select your favorites.</p>
                            </div>
                            {/* Step 2 */}
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-primary-fixed text-primary flex items-center justify-center mb-6 relative">
                                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>delivery_dining</span>
                                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</span>
                                </div>
                                <h3 className="font-headline-sm text-headline-sm mb-3">Live Tracking</h3>
                                <p className="text-secondary font-body-md">Watch your meal's journey in real-time from the kitchen to your door.</p>
                            </div>
                            {/* Step 3 */}
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-primary-fixed text-primary flex items-center justify-center mb-6 relative">
                                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>celebration</span>
                                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</span>
                                </div>
                                <h3 className="font-headline-sm text-headline-sm mb-3">Enjoy Gourmet</h3>
                                <p className="text-secondary font-body-md">Savor restaurant-quality dining in the comfort of your own home.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Newsletter Signup */}
                <section className="py-12 md:py-24 px-4 sm:px-6 md:px-10 lg:px-margin-desktop bg-on-surface text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="max-w-container-max mx-auto relative z-10">
                        <div className="max-w-3xl">
                            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-6 leading-tight">Join the Inner Circle of <span className="text-primary-fixed-dim">Gourmet Lovers</span></h2>
                            <p className="font-body-lg text-body-lg text-surface-variant mb-8 max-w-xl">Subscribe to our newsletter for exclusive tasting invites, secret menu reveals, and early access to new restaurant partners.</p>
                            <form className="flex flex-col sm:flex-row gap-4 max-w-lg" onSubmit={e => e.preventDefault()}>
                                <input className="flex-1 px-6 py-4 rounded-full bg-surface-variant/10 border border-surface-variant/30 text-white placeholder:text-surface-variant focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="Your premium email address" type="email"/>
                                <button className="bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-label-md text-label-md hover:bg-primary transition-all active:scale-95 whitespace-nowrap">
                                    Join Now
                                </button>
                            </form>
                            <p className="mt-4 font-label-sm text-label-sm text-surface-variant/60">We value your privacy. Unsubscribe at any time.</p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Home;
