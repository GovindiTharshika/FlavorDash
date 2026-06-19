import React, { useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { staticPages } from '../data/staticPages';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

const StaticPage = () => {
    const { pathname } = useLocation();
    const slug = pathname.replace(/^\//, '');
    const page = staticPages[slug];

    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    if (!page) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success('Message sent! Our team will get back to you soon.');
        setForm({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="bg-background text-on-surface min-h-screen flex flex-col">
            <main className="flex-1 pt-20 md:pt-28 pb-12 md:pb-20">
                {/* Hero */}
                <section className="px-4 sm:px-6 md:px-10 lg:px-margin-desktop max-w-container-max mx-auto mb-10 md:mb-14">
                    <div className="bg-surface-container-low rounded-[24px] p-6 sm:p-10 md:p-12 border border-outline-variant/20">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary-fixed flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">{page.icon}</span>
                            </div>
                            <div>
                                <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-2">{page.title}</h1>
                                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">{page.subtitle}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="px-4 sm:px-6 md:px-10 lg:px-margin-desktop max-w-container-max mx-auto space-y-10 md:space-y-14">
                    {/* Text sections */}
                    {page.sections?.map((section) => (
                        <section key={section.heading} className="max-w-3xl">
                            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3">{section.heading}</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{section.body}</p>
                        </section>
                    ))}

                    {/* Bullet list */}
                    {page.list && (
                        <section className="bg-surface-container-lowest rounded-[24px] p-6 sm:p-8 border border-outline-variant/10 max-w-3xl">
                            <ul className="space-y-3">
                                {page.list.map((item) => (
                                    <li key={item} className="flex items-start gap-3 font-body-md text-on-surface-variant">
                                        <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0 mt-0.5">check_circle</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Cards grid */}
                    {page.cards && (
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-gutter">
                            {page.cards.map((card) => (
                                <div key={card.title} className="bg-surface-container-lowest rounded-[24px] p-6 border border-outline-variant/10 hover:shadow-lg transition-shadow">
                                    <span className="material-symbols-outlined text-primary text-3xl mb-4">{card.icon}</span>
                                    <h3 className="font-title-lg text-title-lg text-on-surface mb-2">{card.title}</h3>
                                    <p className="font-body-md text-on-surface-variant">{card.desc}</p>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* FAQ */}
                    {page.faq && (
                        <section className="space-y-4 max-w-3xl">
                            {page.faq.map((item) => (
                                <details key={item.q} className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden">
                                    <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer font-label-md text-label-md text-on-surface list-none">
                                        {item.q}
                                        <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
                                    </summary>
                                    <p className="px-5 pb-5 font-body-md text-on-surface-variant border-t border-outline-variant/10 pt-4">{item.a}</p>
                                </details>
                            ))}
                        </section>
                    )}

                    {/* Contact info */}
                    {page.contactInfo && (
                        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                            {page.contactInfo.map((item) => (
                                <div key={item.label} className="flex items-center gap-4 bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10">
                                    <span className="material-symbols-outlined text-primary">{item.icon}</span>
                                    <div>
                                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{item.label}</p>
                                        <p className="font-body-md text-on-surface">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Contact form */}
                    {page.showForm && (
                        <section className="max-w-xl bg-surface-container-lowest rounded-[24px] p-6 sm:p-8 border border-outline-variant/10">
                            <h2 className="font-headline-sm text-headline-sm mb-6">Send a message</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none"
                                    placeholder="Your name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                                <input
                                    className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none"
                                    type="email"
                                    placeholder="Email address"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                                <input
                                    className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none"
                                    placeholder="Subject"
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    required
                                />
                                <textarea
                                    className="w-full bg-surface-container-low border-none rounded-lg p-3 focus:ring-2 focus:ring-primary-container outline-none"
                                    rows="4"
                                    placeholder="How can we help?"
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    required
                                />
                                <button type="submit" className="w-full sm:w-auto bg-primary-container text-on-primary-container px-8 py-3 rounded-full font-label-md hover:scale-[1.02] active:scale-95 transition-all">
                                    Send Message
                                </button>
                            </form>
                        </section>
                    )}

                    {/* CTA */}
                    {page.cta && (
                        <div className="pt-2">
                            <Link
                                to={page.cta.to}
                                className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-label-md text-label-md shadow-[0px_8px_24px_rgba(255,107,0,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {page.cta.label}
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default StaticPage;
