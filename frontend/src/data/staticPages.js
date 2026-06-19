export const staticPages = {
    categories: {
        title: 'Categories',
        subtitle: 'Explore our curated culinary collections',
        icon: 'restaurant_menu',
        sections: [
            {
                heading: 'Browse by taste',
                body: 'From wood-fired pizzas to hand-rolled sushi, FlavorDash organizes every dish into categories so you can find exactly what you crave in seconds.',
            },
        ],
        cards: [
            { icon: 'local_pizza', title: 'Pizza', desc: 'Artisanal sourdough crusts and premium toppings' },
            { icon: 'lunch_dining', title: 'Burgers', desc: 'Gourmet patties, brioche buns, and chef sauces' },
            { icon: 'cake', title: 'Desserts', desc: 'Pastries, cakes, and sweet finales' },
            { icon: 'set_meal', title: 'Sushi', desc: 'Fresh rolls and nigiri from partner kitchens' },
            { icon: 'nutrition', title: 'Healthy', desc: 'Balanced bowls, salads, and light plates' },
            { icon: 'wine_bar', title: 'Drinks', desc: 'Craft beverages, juices, and refreshments' },
        ],
        cta: { label: 'View Full Menu', to: '/menu' },
    },
    'featured-chefs': {
        title: 'Featured Chefs',
        subtitle: 'Meet the culinary artists behind your favorite dishes',
        icon: 'cooking',
        sections: [
            {
                heading: 'Kitchen partners you can trust',
                body: 'We work with experienced chefs and restaurant partners who share our commitment to quality ingredients, consistent preparation, and beautiful presentation.',
            },
        ],
        cards: [
            { icon: 'person', title: 'Chef Amara Silva', desc: 'Modern Sri Lankan fusion — Colombo flagship kitchen' },
            { icon: 'person', title: 'Chef Marco Vieri', desc: 'Italian wood-fired pizza and handmade pasta' },
            { icon: 'person', title: 'Chef Yuki Tanaka', desc: 'Omakase-inspired rolls and seasonal sashimi' },
            { icon: 'person', title: 'Chef Elena Rossi', desc: 'European patisserie and signature desserts' },
        ],
        cta: { label: 'Order from the Menu', to: '/menu' },
    },
    'corporate-dining': {
        title: 'Corporate Dining',
        subtitle: 'Premium meals for teams, meetings, and events',
        icon: 'business_center',
        sections: [
            {
                heading: 'Feed your team without the hassle',
                body: 'FlavorDash Corporate Dining helps companies order gourmet meals for office lunches, client meetings, and team celebrations. Set budgets, schedule deliveries, and invoice centrally.',
            },
            {
                heading: 'What we offer',
                body: 'Custom menus for groups of 10–500+, dietary labeling, on-time delivery windows, and dedicated account support for recurring orders.',
            },
        ],
        list: [
            'Volume pricing for regular office orders',
            'Allergen and dietary filters for every guest',
            'Scheduled delivery to your workplace',
            'Monthly invoicing for finance teams',
        ],
        cta: { label: 'Contact Sales', to: '/contact' },
    },
    'gift-cards': {
        title: 'Gift Cards',
        subtitle: 'Share the gift of gourmet delivery',
        icon: 'card_giftcard',
        sections: [
            {
                heading: 'Perfect for any occasion',
                body: 'Send a FlavorDash gift card to friends, family, or colleagues. Recipients can redeem toward any order on our platform — no expiry on promotional balances.',
            },
        ],
        cards: [
            { icon: 'redeem', title: 'Rs. 2,500', desc: 'Great for a cozy dinner for two' },
            { icon: 'redeem', title: 'Rs. 5,000', desc: 'Ideal for family feasts' },
            { icon: 'redeem', title: 'Rs. 10,000', desc: 'Premium gifting for food lovers' },
            { icon: 'redeem', title: 'Custom amount', desc: 'Choose any value from Rs. 1,000+' },
        ],
        cta: { label: 'Get in Touch', to: '/contact' },
    },
    about: {
        title: 'About Us',
        subtitle: 'Gourmet flavors, delivered with care',
        icon: 'info',
        sections: [
            {
                heading: 'Our story',
                body: 'FlavorDash was founded with a simple belief: restaurant-quality dining should be accessible from home. We partner with skilled chefs and trusted kitchens to deliver meals that are fast, fresh, and thoughtfully prepared.',
            },
            {
                heading: 'What drives us',
                body: 'We obsess over delivery speed, food safety, and customer experience. Every order is tracked from kitchen to doorstep, and our team continuously improves menus based on what our community loves most.',
            },
        ],
        list: [
            '13+ gourmet menu items and growing',
            'Average delivery under 30 minutes',
            'Secure online payments via PayHere',
            'Dedicated support for every customer',
        ],
        cta: { label: 'Start Ordering', to: '/menu' },
    },
    'delivery-areas': {
        title: 'Delivery Areas',
        subtitle: 'See where FlavorDash delivers near you',
        icon: 'location_on',
        sections: [
            {
                heading: 'Currently serving',
                body: 'We deliver across major zones in the Greater Colombo area and are expanding weekly. Enter your address at checkout to confirm availability.',
            },
        ],
        list: [
            'Colombo 01–15 (Fort, Cinnamon Gardens, Bambalapitiya, and more)',
            'Nugegoda, Dehiwala, Mount Lavinia',
            'Rajagiriya, Battaramulla, Kotte',
            'Maharagama, Boralesgamuwa, Kottawa',
        ],
        cta: { label: 'Check at Checkout', to: '/menu' },
    },
    careers: {
        title: 'Careers',
        subtitle: 'Join the team redefining food delivery',
        icon: 'work',
        sections: [
            {
                heading: 'Work with us',
                body: 'FlavorDash is growing across operations, technology, and customer experience. We look for people who care about food, service, and building products customers love.',
            },
        ],
        cards: [
            { icon: 'engineering', title: 'Engineering', desc: 'Build ordering, payments, and logistics tools' },
            { icon: 'support_agent', title: 'Customer Support', desc: 'Help diners and partners every day' },
            { icon: 'local_shipping', title: 'Operations', desc: 'Coordinate kitchens and delivery excellence' },
            { icon: 'campaign', title: 'Marketing', desc: 'Grow our brand and community' },
        ],
        cta: { label: 'Apply Now', to: '/contact' },
    },
    terms: {
        title: 'Terms of Service',
        subtitle: 'The rules and policies for using FlavorDash',
        icon: 'gavel',
        sections: [
            {
                heading: 'Using our platform',
                body: 'By placing an order on FlavorDash, you agree to provide accurate delivery details, pay for your order, and use the service lawfully. Menu items, prices, and availability may change without notice.',
            },
            {
                heading: 'Orders & payments',
                body: 'Orders are confirmed once payment is authorized (online via PayHere) or accepted (cash on delivery). Refunds for cancelled or incorrect orders are handled case-by-case through our support team.',
            },
            {
                heading: 'Privacy',
                body: 'We collect account, order, and delivery information to fulfill your requests and improve our service. We do not sell personal data to third parties. Contact us for data-related requests.',
            },
        ],
        cta: { label: 'Contact Support', to: '/contact' },
    },
    help: {
        title: 'Help Center',
        subtitle: 'Answers to common questions',
        icon: 'help',
        faq: [
            { q: 'How do I place an order?', a: 'Browse the menu, add items to your cart, and proceed to checkout. Sign in, enter your delivery address, and pay online or choose cash on delivery.' },
            { q: 'How long does delivery take?', a: 'Most orders arrive within 25–35 minutes depending on distance and kitchen prep time. You will see updates on your order confirmation page.' },
            { q: 'Can I change or cancel my order?', a: 'Contact support immediately after placing your order. Changes are possible only before the kitchen starts preparing your meal.' },
            { q: 'What payment methods are accepted?', a: 'We accept PayHere (cards and digital wallets in sandbox/production) and cash on delivery in supported areas.' },
            { q: 'An item was missing or incorrect. What do I do?', a: 'Reach out via Contact Support with your order number. We will review and resolve eligible issues promptly.' },
        ],
        cta: { label: 'Still need help?', to: '/contact' },
    },
    safety: {
        title: 'Safety',
        subtitle: 'How we keep your food and data secure',
        icon: 'health_and_safety',
        sections: [
            {
                heading: 'Food safety',
                body: 'Partner kitchens follow hygiene and packaging standards. Hot items are sealed for transit, and cold items are stored appropriately until handoff to delivery.',
            },
            {
                heading: 'Secure payments',
                body: 'Online payments are processed through PayHere with industry-standard encryption. FlavorDash does not store full card numbers on our servers.',
            },
            {
                heading: 'Delivery standards',
                body: 'Riders are trained to handle orders carefully and verify delivery details. Report any safety concern to our support team immediately.',
            },
        ],
        cta: { label: 'Report an Issue', to: '/contact' },
    },
    contact: {
        title: 'Contact Support',
        subtitle: 'We are here to help',
        icon: 'mail',
        sections: [
            {
                heading: 'Get in touch',
                body: 'Questions about an order, partnerships, corporate dining, or careers? Send us a message and our team will respond within one business day.',
            },
        ],
        contactInfo: [
            { icon: 'email', label: 'Email', value: 'support@flavordash.com' },
            { icon: 'call', label: 'Phone', value: '+94 11 234 5678' },
            { icon: 'schedule', label: 'Hours', value: 'Mon–Sun, 8:00 AM – 10:00 PM' },
            { icon: 'location_on', label: 'Office', value: 'Colombo, Sri Lanka' },
        ],
        showForm: true,
    },
    partner: {
        title: 'Partner with Us',
        subtitle: 'Bring your kitchen to the FlavorDash platform',
        icon: 'handshake',
        sections: [
            {
                heading: 'Grow with FlavorDash',
                body: 'Restaurants, cloud kitchens, and independent chefs can list on FlavorDash to reach new customers. We handle ordering, payments, and delivery coordination so you can focus on cooking.',
            },
            {
                heading: 'Why partner?',
                body: 'Access a growing customer base, marketing support, and operational tools designed for high-volume delivery. Onboarding typically takes 1–2 weeks.',
            },
        ],
        list: [
            'Dedicated partner success manager',
            'Menu photography and listing support',
            'Transparent commission structure',
            'Real-time order dashboard',
        ],
        cta: { label: 'Apply to Partner', to: '/contact' },
    },
};

export const staticPageRoutes = Object.keys(staticPages);
