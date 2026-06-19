import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const Checkout = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    const [cart, setCart] = useState([]);
    const [specialInstructions, setSpecialInstructions] = useState({});
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('PayHere'); // 'PayHere' or 'COD'

    // Form state
    const [formData, setFormData] = useState({
        fullName: user ? user.name : '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        instructions: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || prev.fullName,
                phone: user.phone || prev.phone,
                address: user.address || prev.address,
                city: user.city || prev.city,
            }));
        }
    }, [user]);

    useEffect(() => {
        // If state was passed from cart, use it
        if (location.state) {
            setCart(location.state.cart || []);
            setSpecialInstructions(location.state.specialInstructions || {});
            setPromoCode(location.state.promoCode || '');
            setDiscount(location.state.discount || 0);
        } else {
            // Otherwise fallback to localStorage
            const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
            if (storedCart.length === 0) {
                navigate('/cart');
            } else {
                setCart(storedCart);
            }
        }
    }, [location.state, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = 4.99;
    const taxRate = 0.0935; // 9.35% tax rate
    const estimatedTax = subtotal * taxRate;
    const total = subtotal + deliveryFee + estimatedTax - discount;

    const handlePayment = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (cart.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        if (!formData.address || !formData.city || !formData.zipCode) {
            toast.error('Please fill in your delivery address details');
            return;
        }

        try {
            const foodRes = await api.get('/food');
            const validIds = new Set((foodRes.data || []).map(item => item.id));
            const invalidItems = cart.filter(item => !validIds.has(item.food_item_id));
            if (invalidItems.length > 0) {
                const names = invalidItems.map(i => i.name).join(', ');
                toast.error(`Some items are no longer available (${names}). Please remove them from your cart.`);
                return;
            }

            const orderData = {
                items: cart.map((item, index) => ({
                    food_item_id: item.food_item_id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    special_instructions: specialInstructions[index] || ''
                })),
                subtotal: subtotal,
                delivery_fee: deliveryFee,
                tax: estimatedTax,
                discount: discount,
                total_amount: total,
                promo_code: promoCode || null,
                delivery_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
                phone: formData.phone,
                payment_method: paymentMethod
            };

            // debug: show exact payload sent to backend
            console.log('ORDER DATA:', orderData);
            const response = await api.post('/orders', orderData);
            const orderId = String(response.data.order_id);
            const amountFormatted = total.toFixed(2);
            
            const placedOrder = response.data.order;
            const confirmationState = { orderId, paymentMethod, order: placedOrder };

            if (paymentMethod === 'COD') {
                toast.success('Order placed successfully! Order ID: ' + orderId);
                localStorage.removeItem('cart');
                navigate('/order-confirmation', { state: confirmationState });
                return;
            }

            // PayHere Flow
            const hashResponse = await api.post('/payment/hash', {
                order_id: orderId,
                amount: amountFormatted,
                currency: 'LKR'
            });

            const { hash, merchant_id, sandbox } = hashResponse.data;

            const payment = {
                sandbox: sandbox !== false,
                merchant_id,
                // Popup mode: omit return/cancel URLs; use onCompleted/onDismissed callbacks instead.
                return_url: undefined,
                cancel_url: undefined,
                notify_url: 'http://localhost:5000/api/payment/notify',
                order_id: orderId,
                items: 'Food Order',
                amount: amountFormatted,
                currency: 'LKR',
                hash,
                first_name: formData.fullName.split(' ')[0] || user.name,
                last_name: formData.fullName.split(' ').slice(1).join(' ') || '',
                email: user.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                country: 'Sri Lanka'
            };

            // PayHere callbacks
            window.payhere.onCompleted = function onCompleted(completedOrderId) {
                toast.success('Payment completed successfully!');
                localStorage.removeItem('cart');
                navigate('/order-confirmation', {
                    state: {
                        orderId: String(completedOrderId),
                        paymentMethod: 'PayHere',
                        order: placedOrder ? { ...placedOrder, payment_status: 'paid' } : undefined
                    }
                });
            };

            window.payhere.onDismissed = function onDismissed() {
                toast.error('Payment popup closed');
            };

            window.payhere.onError = function onError(error) {
                toast.error('Payment error: ' + error);
            };

            if (!window.payhere) {
                toast.error('PayHere script failed to load. Please refresh and try again.');
                return;
            }

            window.payhere.startPayment(payment);

        } catch (err) {
            console.error('Error placing order:', err);
            toast.error('Error placing order: ' + (err.response?.data?.message || 'Please try again'));
        }
    };

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
            <main className="flex-grow pt-20 md:pt-32 pb-12 md:pb-20 px-4 sm:px-6 md:px-10 lg:px-margin-desktop max-w-container-max mx-auto w-full">
                <div className="mb-stack-lg">
                    <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Finalize Your Order</h1>
                    <p className="font-body-md text-on-surface-variant">Review your curated selection and provide delivery details.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                    {/* Left Column: Order Summary */}
                    <div className="lg:col-span-5 space-y-gutter">
                        <section className="bg-surface-container-lowest p-stack-lg rounded-lg shadow-[0px_4px_20px_rgba(28,28,26,0.04)]">
                            <h2 className="font-headline-sm text-headline-sm mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>receipt_long</span>
                                Order Summary
                            </h2>
                            <div className="space-y-6">
                                {cart.map((item, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                        <div className="w-full sm:w-20 h-40 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container max-w-[200px] mx-auto sm:mx-0">
                                            <img className="w-full h-full object-cover" alt={item.name} src={item.image_url || 'https://via.placeholder.com/160x160?text=Food'} />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-title-lg text-title-lg text-on-surface">{item.name}</p>
                                            <p className="font-body-md text-on-surface-variant">Qty: {item.quantity} {specialInstructions[index] ? `• ${specialInstructions[index]}` : ''}</p>
                                        </div>
                                        <p className="font-label-md text-label-md text-on-surface">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-6 border-t border-outline-variant/30 space-y-3">
                                <div className="flex justify-between font-body-md text-on-surface-variant">
                                    <span>Subtotal</span>
                                    <span>Rs. {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-body-md text-on-surface-variant">
                                    <span>Delivery Fee</span>
                                    <span>Rs. {deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-body-md text-on-surface-variant">
                                    <span>Tax</span>
                                    <span>Rs. {estimatedTax.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between font-body-md text-primary">
                                        <span>Discount</span>
                                        <span>-Rs. {discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-headline-sm text-headline-sm text-primary mt-4">
                                    <span>Total</span>
                                    <span>Rs. {total.toFixed(2)}</span>
                                </div>
                            </div>
                        </section>
                        <div className="bg-surface-container p-4 rounded-lg flex items-center gap-3">
                            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>verified_user</span>
                            <p className="font-label-sm text-label-sm text-tertiary">FlavorDash ensures your data is protected with 256-bit SSL encryption.</p>
                        </div>
                    </div>
                    {/* Right Column: Delivery & Payment */}
                    <div className="lg:col-span-7 space-y-gutter">
                        <section className="bg-surface-container-lowest p-stack-lg rounded-lg shadow-[0px_4px_20px_rgba(28,28,26,0.04)]">
                            <h2 className="font-headline-sm text-headline-sm mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>local_shipping</span>
                                Delivery Address
                            </h2>
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="font-label-md text-label-md text-on-surface-variant">Full Name</label>
                                        <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none transition-shadow" type="text" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="font-label-md text-label-md text-on-surface-variant">Phone Number</label>
                                        <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none transition-shadow" type="tel" placeholder="+1 (555) 000-9876" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="font-label-md text-label-md text-on-surface-variant">Street Address</label>
                                    <input name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none transition-shadow" placeholder="123 Gourmet Lane" type="text" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="font-label-md text-label-md text-on-surface-variant">City</label>
                                        <input name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none transition-shadow" placeholder="New York" type="text" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="font-label-md text-label-md text-on-surface-variant">State</label>
                                        <input name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none transition-shadow" placeholder="NY" type="text" />
                                    </div>
                                    <div className="space-y-1 col-span-2 md:col-span-1">
                                        <label className="font-label-md text-label-md text-on-surface-variant">Zip Code</label>
                                        <input name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none transition-shadow" placeholder="10001" type="text" />
                                    </div>
                                </div>
                                <div className="space-y-1 pt-2">
                                    <label className="font-label-md text-label-md text-on-surface-variant">Delivery Instructions (Optional)</label>
                                    <textarea name="instructions" value={formData.instructions} onChange={handleInputChange} className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none transition-shadow" placeholder="e.g. Ring the bell twice or leave at the front desk" rows="2"></textarea>
                                </div>
                            </form>
                        </section>
                        <section className="bg-surface-container-lowest p-stack-lg rounded-lg shadow-[0px_4px_20px_rgba(28,28,26,0.04)] relative overflow-hidden">
                            {/* Sandbox Badge Overlay */}
                            <div className="absolute top-4 right-4 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 z-10">
                                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>bug_report</span>
                                Sandbox Mode
                            </div>
                            <h2 className="font-headline-sm text-headline-sm mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>account_balance_wallet</span>
                                Payment Method
                            </h2>
                            <div className="space-y-4 mb-6">
                                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'PayHere' ? 'border-primary bg-primary-fixed/10' : 'border-outline-variant/30 hover:border-outline-variant/60'}`}>
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="PayHere" 
                                        checked={paymentMethod === 'PayHere'} 
                                        onChange={() => setPaymentMethod('PayHere')}
                                        className="w-5 h-5 text-primary focus:ring-primary"
                                    />
                                    <div className="flex-grow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0">
                                        <span className="font-label-md text-on-surface text-base sm:text-lg">Pay securely online</span>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <img alt="Visa" className="h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCi_uFmE2RKQnoUtI0DWS3CPzQHW9LFgIA-wP2oTjwAJS5msN0DoyLKYT1fw-8DIhVPD9ZHH5zZAaVEjQfsPRvulmfrAfed4RC9cbWRynUBoFovPMLcFkc4i7azE41YPvG5nejfLaIAl_XF_JBdu30mPf733s9FXEM2cRNvigZ_6p5maaQIFHHnhKMB14rQ9ea-4bQQE9z08BRoYiKce6I313as8sd48dzgtxgYmUn2R0Pp2aO5pwX_o-9h0JEY9bpVfcdcO_AKRpHX"/>
                                            <img alt="Mastercard" className="h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqQUtHqXsMLuwzjWLsmAKsCnV4EJUIucTvjn2yl2EgWKhKoEeQXbSEqhHRysniv4UerdD4L-8rRLIFe42nt7eI7KSoHcO5OCl6Yj6sbasvdW7Lsjz2-lGDyERAlK955lf1m7Yq5QvFmRUBXYuK6JiEqM5oGd135rcVcDBzYtgtftZ12rP33WLfwjC1FFmd-EvrAyAECz_HbJE0yF6wrupFyWyji9XFaHB0vlWb4vE1xImPBOIcYdk5yVsDjsz4TJ3eBmY2cnMSrlO1"/>
                                        </div>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary-fixed/10' : 'border-outline-variant/30 hover:border-outline-variant/60'}`}>
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="COD" 
                                        checked={paymentMethod === 'COD'} 
                                        onChange={() => setPaymentMethod('COD')}
                                        className="w-5 h-5 text-primary focus:ring-primary"
                                    />
                                    <div className="flex-grow">
                                        <span className="font-label-md text-on-surface text-lg">Cash on Delivery</span>
                                    </div>
                                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>payments</span>
                                </label>
                            </div>

                            {paymentMethod === 'PayHere' ? (
                                <div className="p-6 border-2 border-primary-container bg-primary-fixed/20 rounded-lg flex flex-col items-center text-center space-y-6">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary-container text-4xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>payments</span>
                                        <span className="font-display-lg text-primary-container" style={{ fontSize: '28px' }}>PayHere</span>
                                    </div>
                                    <p className="font-body-md text-on-surface-variant max-w-sm">
                                        Click below to complete your payment securely via the PayHere gateway. We support all major credit cards and digital wallets.
                                    </p>
                                    <button onClick={handlePayment} className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-label-md text-lg shadow-[0px_8px_24px_rgba(255,107,0,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                        Pay with PayHere
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>arrow_forward</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="p-6 border-2 border-primary-container bg-primary-fixed/20 rounded-lg flex flex-col items-center text-center space-y-6">
                                    <span className="material-symbols-outlined text-primary-container text-4xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>delivery_dining</span>
                                    <p className="font-body-md text-on-surface-variant max-w-sm">
                                        You will pay the delivery rider in cash upon receiving your order. Please have exact change ready if possible.
                                    </p>
                                    <button onClick={handlePayment} className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-label-md text-lg shadow-[0px_8px_24px_rgba(255,107,0,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                        Confirm Order
                                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>check_circle</span>
                                    </button>
                                </div>
                            )}
                            <div className="mt-6 flex items-center justify-center gap-2">
                                <img alt="Verified" className="h-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJH5WmXzuM6phgl14lFX3BgeU_CP5bkqkjbV96AYSjSifBYfc2gPzN6nFDzEhT9Fb7MwMGM_T5Tq9ij1jQyrIiaLFHQShgGYTdgrbCLYrHtFG34r1AegLdt0NNIfVfl8uQbTvl04I5S4ZrGwl4mFHj92HaFKKX8GRNs-90VHgmC5l3EQEG32Aq3JpowQaHI2vA3EYsszZUgxJFGZveZfhjc-2bPS9x81fkWtu5nJT94zBvD6fLoEPFQrnidzhZyz1Mrqaq_sN0AL_6"/>
                                <div className="h-8 w-[1px] bg-outline-variant/30 mx-2"></div>
                                <div className="flex items-center gap-1 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>lock</span>
                                    <span className="text-[10px] font-bold tracking-tight">SECURE 256-BIT PAYMENT GATEWAY</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
