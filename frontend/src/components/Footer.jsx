import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
    <footer className="bg-surface-container-highest dark:bg-surface-dim border-t border-outline-variant dark:border-outline">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter px-4 sm:px-6 md:px-10 lg:px-margin-desktop py-8 md:py-12 max-w-container-max mx-auto">
            <div className="col-span-1 md:col-span-1">
                <Link to="/" className="font-headline-md text-headline-md text-primary mb-4 block">FlavorDash</Link>
                <p className="text-on-surface-variant font-body-md text-body-md mb-6">
                    Redefining gourmet delivery for the modern epicurean. Experience quality, speed, and elegance in every bite.
                </p>
                <div className="flex gap-4">
                    <button type="button" className="w-10 h-10 rounded-full border border-outline flex items-center justify-center hover:bg-primary hover:text-white transition-colors" aria-label="Website">
                        <span className="material-symbols-outlined text-lg">public</span>
                    </button>
                    <button type="button" className="w-10 h-10 rounded-full border border-outline flex items-center justify-center hover:bg-primary hover:text-white transition-colors" aria-label="Share">
                        <span className="material-symbols-outlined text-lg">share</span>
                    </button>
                </div>
            </div>
            <div>
                <h4 className="font-label-md text-label-md text-on-surface mb-6">Discover</h4>
                <ul className="space-y-4">
                    <li><Link to="/categories" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors">Categories</Link></li>
                    <li><Link to="/featured-chefs" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors">Featured Chefs</Link></li>
                    <li><Link to="/corporate-dining" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors">Corporate Dining</Link></li>
                    <li><Link to="/gift-cards" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors">Gift Cards</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-label-md text-label-md text-on-surface mb-6">Company</h4>
                <ul className="space-y-4">
                    <li><Link to="/about" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors">About Us</Link></li>
                    <li><Link to="/delivery-areas" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors">Delivery Areas</Link></li>
                    <li><Link to="/careers" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors">Careers</Link></li>
                    <li><Link to="/terms" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors">Terms of Service</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-label-md text-label-md text-on-surface mb-6">Support</h4>
                <ul className="space-y-4">
                    <li><Link to="/help" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors">Help Center</Link></li>
                    <li><Link to="/safety" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors">Safety</Link></li>
                    <li><Link to="/contact" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors">Contact Support</Link></li>
                    <li><Link to="/partner" className="text-on-surface-variant font-body-md text-body-md hover:text-primary transition-colors">Partner with Us</Link></li>
                </ul>
            </div>
        </div>
        <div className="border-t border-outline-variant/30 py-6 md:py-8 px-4 sm:px-6 md:px-10 lg:px-margin-desktop max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-on-surface-variant font-body-md text-body-md">© 2024 FlavorDash. All rights reserved.</p>
            <div className="flex gap-8">
                <Link to="/terms" className="text-on-surface-variant font-body-md text-body-md hover:text-primary">Privacy Policy</Link>
                <Link to="/terms" className="text-on-surface-variant font-body-md text-body-md hover:text-primary">Cookies</Link>
            </div>
        </div>
    </footer>
);

export default Footer;
