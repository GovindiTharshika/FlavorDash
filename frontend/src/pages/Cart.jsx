import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Cart = () => {
    const [cart, setCart] = useState([]);
    const [specialInstructions, setSpecialInstructions] = useState({});
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [suggestedItems, setSuggestedItems] = useState([]);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        setCart(JSON.parse(localStorage.getItem('cart')) || []);
    }, []);

    useEffect(() => {
        const loadSuggestions = async () => {
            try {
                const res = await api.get('/food');
                const foodItems = res.data || [];
                const cartIds = new Set(cart.map(item => item.food_item_id));
                const suggestions = foodItems
                    .filter(item => !cartIds.has(item.id))
                    .slice(0, 2)
                    .map(item => ({ ...item, price: Number(item.price) }));
                setSuggestedItems(suggestions);
            } catch {
                setSuggestedItems([]);
            }
        };
        loadSuggestions();
    }, [cart]);

    const updateQuantity = (index, change) => {
        const newCart = [...cart];
        newCart[index].quantity = Math.max(1, newCart[index].quantity + change);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cart-updated'));
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cart-updated'));
    };

    const updateSpecialInstruction = (index, instruction) => {
        setSpecialInstructions(prev => ({
            ...prev,
            [index]: instruction
        }));
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = 4.99;
    const taxRate = 0.0935; // 9.35% tax rate
    const estimatedTax = subtotal * taxRate;
    const total = subtotal + deliveryFee + estimatedTax - discount;

    const applyPromoCode = () => {
        // Mock promo code logic - in real app, validate with backend
        if (promoCode.toLowerCase() === 'welcome10') {
            setDiscount(subtotal * 0.1);
            toast.success('Promo code applied! 10% discount.');
        } else if (promoCode.toLowerCase() === 'save5') {
            setDiscount(5);
            toast.success('Promo code applied! Rs. 5 discount.');
        } else {
            toast.error('Invalid promo code');
            setDiscount(0);
        }
    };

    const addSuggestedItem = (item) => {
        const existingIndex = cart.findIndex(cartItem => cartItem.food_item_id === item.id);
        let newCart;
        
        if (existingIndex >= 0) {
            newCart = [...cart];
            newCart[existingIndex].quantity += 1;
        } else {
            newCart = [...cart, { food_item_id: item.id, name: item.name, price: Number(item.price), quantity: 1, image_url: item.image_url }];
        }
        
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cart-updated'));
    };

    const handleCheckout = () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        // Navigate to the new Checkout page, passing along the cart and pricing state
        navigate('/checkout', { 
            state: { 
                cart, 
                specialInstructions, 
                promoCode, 
                discount 
            } 
        });
    };

    return (
        <div className="bg-surface font-body-md text-on-surface min-h-screen">
            <main className="pt-20 md:pt-24 pb-12 md:pb-20 px-4 sm:px-6 md:px-10 max-w-[1280px] mx-auto w-full">
                {cart.length === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Your Gourmet Basket is Empty</h2>
                        <p className="text-secondary font-body-md mb-8">Add some delicious items to get started!</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-primary-container text-on-surface px-8 py-4 rounded-full font-label-md text-lg shadow-lift hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Browse Menu
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
                        {/* Shopping Cart List */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-outline-variant/20 pb-4">
                                <h2 className="font-headline-md text-headline-md text-on-surface">Your Gourmet Basket</h2>
                                <p className="font-label-md text-label-md text-secondary">{cart.length} items from <span className="text-primary">Artisan Kitchen</span></p>
                            </div>

                            {/* Cart Items Container */}
                            <div className="space-y-4">
                                {cart.map((item, index) => (
                                    <div key={index} className="bg-white rounded-[24px] shadow-soft p-4 flex flex-col sm:flex-row gap-4 sm:gap-6 transition-all hover:shadow-md border border-outline-variant/10">
                                        <div className="w-full sm:w-32 md:w-40 h-40 sm:h-32 md:h-40 flex-shrink-0 rounded-xl overflow-hidden bg-surface-container mx-auto sm:mx-0 max-w-[200px] sm:max-w-none">
                                            <img 
                                                className="w-full h-full object-cover" 
                                                alt={item.name}
                                                src={item.image_url || 'https://via.placeholder.com/160x160?text=Food'} 
                                            />
                                        </div>
                                        <div className="flex-grow flex flex-col justify-between">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                <div className="min-w-0">
                                                    <h3 className="font-headline-sm text-headline-sm">{item.name}</h3>
                                                    <p className="text-secondary font-body-md mt-1 line-clamp-2">{item.description || 'Delicious gourmet item'}</p>
                                                </div>
                                                <span className="font-headline-sm text-headline-sm text-on-surface flex-shrink-0">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                            <div className="mt-4">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-secondary mb-1 block">Special Instructions</label>
                                                <input 
                                                    className="w-full bg-surface-container border-none rounded-lg p-2 text-label-md focus:ring-2 focus:ring-primary-container transition-all"
                                                    placeholder="e.g. Extra crispy crust, please!"
                                                    type="text"
                                                    value={specialInstructions[index] || ''}
                                                    onChange={(e) => updateSpecialInstruction(index, e.target.value)}
                                                />
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
                                                <div className="bg-on-background rounded-full p-1 flex items-center gap-4">
                                                    <button 
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-90 transition-all"
                                                        onClick={() => updateQuantity(index, -1)}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">remove</span>
                                                    </button>
                                                    <span className="text-white font-label-md">{item.quantity}</span>
                                                    <button 
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-90 transition-all"
                                                        onClick={() => updateQuantity(index, 1)}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">add</span>
                                                    </button>
                                                </div>
                                                <button 
                                                    className="text-error font-label-md flex items-center gap-1 hover:underline active:scale-95 transition-all"
                                                    onClick={() => removeFromCart(index)}
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <aside className="lg:col-span-4 order-first lg:order-last">
                            <div className="lg:sticky lg:top-24 space-y-4">
                                <div className="bg-white rounded-[24px] shadow-soft p-5 sm:p-8 border border-outline-variant/10">
                                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Order Summary</h3>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center text-secondary font-body-md">
                                            <span>Subtotal</span>
                                            <span>Rs. {subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-secondary font-body-md">
                                            <span>Delivery Fee</span>
                                            <span>Rs. {deliveryFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-secondary font-body-md">
                                            <span>Estimated Taxes</span>
                                            <span>Rs. {estimatedTax.toFixed(2)}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between items-center text-primary font-body-md">
                                                <span>Discount</span>
                                                <span>-Rs. {discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                                            <span className="font-headline-sm text-headline-sm">Total</span>
                                            <span className="font-display-lg text-[32px] text-on-surface">Rs. {total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3">
                                            <span className="material-symbols-outlined text-primary">local_offer</span>
                                            <input 
                                                className="bg-transparent border-none p-0 flex-grow text-label-md focus:ring-0"
                                                placeholder="Promo code"
                                                type="text"
                                                value={promoCode}
                                                onChange={(e) => setPromoCode(e.target.value)}
                                            />
                                            <button 
                                                className="text-primary font-bold text-label-md uppercase hover:opacity-80"
                                                onClick={applyPromoCode}
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        <button 
                                            onClick={handleCheckout}
                                            className="w-full bg-primary-container text-on-surface py-5 rounded-full font-label-md text-lg flex items-center justify-center gap-2 shadow-lift hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            Proceed to Checkout
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </button>
                                    </div>
                                    <div className="mt-6 flex items-center justify-center gap-2 text-secondary font-label-sm uppercase tracking-widest">
                                        <span className="material-symbols-outlined text-sm">lock</span>
                                        Secure Payment
                                    </div>
                                </div>

                                {/* Upsell / Suggested Section */}
                                {suggestedItems.length > 0 && (
                                    <div className="bg-surface-container-high rounded-[24px] p-6">
                                        <p className="font-label-md text-label-md text-secondary mb-4">Complete your meal</p>
                                        {suggestedItems.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 group cursor-pointer">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white">
                                                    <img 
                                                        className="w-full h-full object-cover" 
                                                        alt={item.name}
                                                        src={item.image_url} 
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <h4 className="font-label-md text-on-surface group-hover:text-primary transition-colors">{item.name}</h4>
                                                    <p className="text-secondary text-[12px]">Rs. {Number(item.price).toFixed(2)}</p>
                                                </div>
                                                <button 
                                                    className="bg-white p-2 rounded-full shadow-sm hover:bg-primary-container hover:text-white transition-all"
                                                    onClick={() => addSuggestedItem(item)}
                                                >
                                                    <span className="material-symbols-outlined text-sm">add</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Cart;
