import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderId = location.state?.orderId;
    const paymentMethod = location.state?.paymentMethod || 'PayHere';

    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!location.state?.order);

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                const res = await api.get(`/orders/${orderId}`);
                setOrder(res.data);
            } catch (err) {
                console.error('Failed to load order:', err);
                if (!location.state?.order) {
                    toast.error('Could not load order details');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, location.state?.order]);

    const items = order?.items || [];
    const subtotal = Number(order?.subtotal || 0);
    const deliveryFee = Number(order?.delivery_fee || 0);
    const tax = Number(order?.tax || 0);
    const discount = Number(order?.discount || 0);
    const total = Number(order?.total_amount || 0);
    const paymentStatus = order?.payment_status || 'pending';
    const isPaid = paymentStatus === 'paid';
    const isCod = paymentMethod === 'COD' || order?.payment_method === 'COD';

    if (loading) {
        return (
            <div className="bg-background text-on-background font-body-md min-h-screen flex items-center justify-center">
                <p className="text-on-surface-variant">Loading your order...</p>
            </div>
        );
    }

    if (!orderId || !order) {
        return (
            <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-on-surface-variant">No order found.</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-label-md"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
            <main className="flex-grow pt-20 md:pt-32 pb-12 md:pb-20 px-4 sm:px-6 md:px-10 lg:px-margin-desktop max-w-container-max mx-auto w-full">
                <div className="mb-stack-lg">
                    <h1 className="font-headline-md text-headline-md text-on-surface mb-2">
                        {isCod || isPaid ? 'Order Confirmed!' : 'Order Placed'}
                    </h1>
                    <p className="font-body-md text-on-surface-variant">
                        Order #{orderId} — {isCod ? 'Cash on Delivery' : isPaid ? 'Payment successful' : 'Payment pending'}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                    <div className="lg:col-span-5 space-y-gutter">
                        <section className="bg-surface-container-lowest p-stack-lg rounded-lg shadow-[0px_4px_20px_rgba(28,28,26,0.04)]">
                            <h2 className="font-headline-sm text-headline-sm mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">receipt_long</span>
                                Order Summary
                            </h2>
                            <div className="space-y-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                        <div className="w-full sm:w-20 h-40 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container max-w-[200px] mx-auto sm:mx-0">
                                            <img
                                                className="w-full h-full object-cover"
                                                alt={item.name}
                                                src={item.image_url || '/food-placeholder.svg'}
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-title-lg text-title-lg text-on-surface">{item.name}</p>
                                            <p className="font-body-md text-on-surface-variant">
                                                Qty: {item.quantity}
                                                {item.special_instructions ? ` • ${item.special_instructions}` : ''}
                                            </p>
                                        </div>
                                        <p className="font-label-md text-label-md text-on-surface text-right sm:text-left">
                                            Rs. {(Number(item.price_at_time) * item.quantity).toFixed(2)}
                                        </p>
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
                                    <span>Rs. {tax.toFixed(2)}</span>
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

                        {order.delivery_address && (
                            <div className="bg-surface-container p-4 rounded-lg flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary">local_shipping</span>
                                <div>
                                    <p className="font-label-md text-label-md text-on-surface">Delivery Address</p>
                                    <p className="font-body-md text-on-surface-variant">{order.delivery_address}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-7 space-y-gutter">
                        <section className="bg-surface-container-lowest p-stack-lg rounded-lg shadow-[0px_4px_20px_rgba(28,28,26,0.04)] relative overflow-hidden">
                            {!isCod && (
                                <div className="absolute top-4 right-4 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 z-10">
                                    <span className="material-symbols-outlined text-[12px]">bug_report</span>
                                    Sandbox Mode
                                </div>
                            )}
                            <h2 className="font-headline-sm text-headline-sm mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                                Payment
                            </h2>

                            {isCod ? (
                                <div className="p-6 border-2 border-primary-container bg-primary-fixed/20 rounded-lg flex flex-col items-center text-center space-y-4">
                                    <span className="material-symbols-outlined text-primary-container text-4xl">delivery_dining</span>
                                    <p className="font-body-md text-on-surface-variant max-w-sm">
                                        Your order has been placed. Pay Rs. {total.toFixed(2)} in cash when your order arrives.
                                    </p>
                                </div>
                            ) : isPaid ? (
                                <div className="p-6 border-2 border-primary-container bg-primary-fixed/20 rounded-lg flex flex-col items-center text-center space-y-4">
                                    <span className="material-symbols-outlined text-primary-container text-4xl">check_circle</span>
                                    <p className="font-body-md text-on-surface-variant max-w-sm">
                                        Payment of Rs. {total.toFixed(2)} received via PayHere. Thank you!
                                    </p>
                                </div>
                            ) : (
                                <div className="p-6 border-2 border-primary-container bg-primary-fixed/20 rounded-lg flex flex-col items-center text-center space-y-6">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary-container text-4xl">payments</span>
                                        <span className="font-display-lg text-primary-container text-2xl">PayHere</span>
                                    </div>
                                    <p className="font-body-md text-on-surface-variant max-w-sm">
                                        Complete your payment via the PayHere gateway. If payment failed, retry from checkout.
                                    </p>
                                    <button
                                        onClick={() => navigate('/checkout')}
                                        className="w-full bg-primary-container text-on-primary-container py-4 rounded-full font-label-md text-lg shadow-[0px_8px_24px_rgba(255,107,0,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                    >
                                        Retry Payment with PayHere
                                    </button>
                                </div>
                            )}

                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={() => navigate('/')}
                                    className="text-primary font-label-md hover:underline"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderConfirmation;
