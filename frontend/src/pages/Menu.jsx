import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import {
    CATEGORY_OPTIONS,
    DIETARY_OPTIONS,
    PRICE_MIN,
    PRICE_MAX,
    filterFoodItems,
} from '../utils/foodFilters';

const Menu = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [foodItems, setFoodItems] = useState([]);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState(['all']);
    const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
    const [selectedDietary, setSelectedDietary] = useState([]);

    const searchQuery = searchParams.get('q') || '';

    useEffect(() => {
        api.get('/food')
            .then((res) => setFoodItems(res.data || []))
            .catch(() => setFoodItems([]));
    }, []);

    const filteredItems = useMemo(
        () =>
            filterFoodItems(foodItems, {
                search: searchQuery,
                categories: selectedCategories,
                maxPrice,
                dietary: selectedDietary,
            }),
        [foodItems, searchQuery, selectedCategories, maxPrice, selectedDietary]
    );

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (!selectedCategories.includes('all') && selectedCategories.length) count += 1;
        if (maxPrice < PRICE_MAX) count += 1;
        if (selectedDietary.length) count += 1;
        if (searchQuery) count += 1;
        return count;
    }, [selectedCategories, maxPrice, selectedDietary, searchQuery]);

    const clearFilters = useCallback(() => {
        setSelectedCategories(['all']);
        setMaxPrice(PRICE_MAX);
        setSelectedDietary([]);
        if (searchQuery) {
            setSearchParams({});
        }
    }, [searchQuery, setSearchParams]);

    const toggleCategory = (id) => {
        if (id === 'all') {
            setSelectedCategories(['all']);
            return;
        }
        setSelectedCategories((prev) => {
            const withoutAll = prev.filter((c) => c !== 'all');
            const next = withoutAll.includes(id)
                ? withoutAll.filter((c) => c !== id)
                : [...withoutAll, id];
            return next.length ? next : ['all'];
        });
    };

    const toggleDietary = (id) => {
        setSelectedDietary((prev) =>
            prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
        );
    };

    const addToCart = (item) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existing = cart.find((ci) => ci.food_item_id === item.id);
        if (existing) existing.quantity += 1;
        else {
            cart.push({
                food_item_id: item.id,
                name: item.name,
                price: Number(item.price),
                quantity: 1,
                image_url: item.image_url,
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cart-updated'));
        toast.success('Added to cart!');
    };

    const filterPanel = (
        <div className="bg-surface-container-low rounded-[24px] p-4 sm:p-6 border border-outline-variant/20">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-sm text-headline-sm">Filters</h3>
                <button
                    type="button"
                    onClick={clearFilters}
                    className="text-label-sm text-primary hover:underline disabled:opacity-40"
                    disabled={activeFilterCount === 0}
                >
                    Clear all
                </button>
            </div>

            <div className="mb-8">
                <p className="font-label-md text-label-md mb-4 uppercase tracking-wider text-secondary">Categories</p>
                <div className="space-y-3">
                    {CATEGORY_OPTIONS.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-outline text-primary focus:ring-primary"
                                checked={selectedCategories.includes(cat.id)}
                                onChange={() => toggleCategory(cat.id)}
                            />
                            <span className="text-body-md group-hover:text-primary">{cat.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="mb-8">
                <p className="font-label-md text-label-md mb-4 uppercase tracking-wider text-secondary">Price Range</p>
                <div className="px-2">
                    <input
                        type="range"
                        min={PRICE_MIN}
                        max={PRICE_MAX}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between mt-2 text-label-sm text-on-surface-variant font-bold">
                        <span>Rs. {PRICE_MIN}</span>
                        <span className="text-primary">
                            Up to Rs. {maxPrice >= PRICE_MAX ? '100+' : maxPrice}
                        </span>
                    </div>
                </div>
            </div>

            <div>
                <p className="font-label-md text-label-md mb-4 uppercase tracking-wider text-secondary">Dietary</p>
                <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((tag) => {
                        const active = selectedDietary.includes(tag.id);
                        return (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => toggleDietary(tag.id)}
                                className={`px-4 py-1.5 rounded-full border text-label-sm transition-colors ${
                                    active
                                        ? 'bg-primary text-on-primary border-primary'
                                        : 'border-on-surface-variant hover:bg-primary-fixed-dim'
                                }`}
                            >
                                {tag.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <main className="pt-20 md:pt-28 pb-12 md:pb-20 max-w-container-max mx-auto px-4 sm:px-6 md:px-10 lg:px-margin-desktop">
            <header className="mb-6 md:mb-stack-lg">
                <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-2">
                    Our Gourmet Selection
                </h1>
                <p className="text-body-md sm:text-body-lg text-on-surface-variant max-w-2xl">
                    Discover culinary masterpieces delivered to your door. From artisanal sourdough pizzas to
                    hand-crafted desserts, every dish is a celebration of flavor.
                </p>
                {(searchQuery || activeFilterCount > 0) && (
                    <p className="mt-3 text-label-md text-on-surface-variant">
                        Showing {filteredItems.length} of {foodItems.length} dishes
                        {searchQuery && (
                            <>
                                {' '}for &ldquo;<span className="text-primary font-bold">{searchQuery}</span>&rdquo;
                            </>
                        )}
                    </p>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                <div className="lg:hidden">
                    <button
                        type="button"
                        onClick={() => setFiltersOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/20 font-label-md"
                    >
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">tune</span>
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </span>
                        <span className="material-symbols-outlined">{filtersOpen ? 'expand_less' : 'expand_more'}</span>
                    </button>
                    {filtersOpen && <div className="mt-4">{filterPanel}</div>}
                </div>

                <aside className="hidden lg:block lg:col-span-3 space-y-stack-lg">
                    <div className="sticky top-28">{filterPanel}</div>
                </aside>

                <div className="lg:col-span-9">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-gutter">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="group bg-surface-container-lowest rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-outline-variant/10 flex flex-col"
                            >
                                <div className="relative overflow-hidden h-48 sm:h-64">
                                    <img
                                        src={item.image_url || '/food-placeholder.svg'}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    {item.category && (
                                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-label-sm font-bold capitalize">
                                            {item.category}
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 sm:p-6 bg-[#FFFBF0] flex-1 flex flex-col">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <h3 className="font-headline-sm text-headline-sm leading-tight">{item.name}</h3>
                                        <span className="font-headline-sm text-primary whitespace-nowrap">
                                            Rs. {Number(item.price).toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-body-md text-on-surface-variant mb-4 sm:mb-6 line-clamp-2">
                                        {item.description}
                                    </p>
                                    <div className="mt-auto">
                                        {Number(item.stock_quantity ?? 1) > 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => addToCart(item)}
                                                className="w-full py-3 sm:py-4 rounded-xl bg-primary text-white font-label-md flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                            >
                                                <span className="material-symbols-outlined">add_shopping_cart</span>
                                                Add to Cart
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                className="w-full py-3 sm:py-4 rounded-xl bg-surface-container text-on-surface-variant font-label-md cursor-not-allowed"
                                            >
                                                Out of Stock
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {foodItems.length === 0 && (
                        <p className="text-center text-on-surface-variant py-12">No menu items available.</p>
                    )}

                    {foodItems.length > 0 && filteredItems.length === 0 && (
                        <div className="text-center py-12 space-y-4">
                            <p className="text-on-surface-variant font-body-md">No dishes match your filters.</p>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="text-primary font-label-md hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Menu;
