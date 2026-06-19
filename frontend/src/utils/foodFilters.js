export const CATEGORY_OPTIONS = [
    { id: 'all', label: 'All Dishes', keywords: [] },
    { id: 'pizza', label: 'Artisanal Pizza', keywords: ['pizza'] },
    { id: 'burgers', label: 'Gourmet Burgers', keywords: ['burger', 'burgers'] },
    { id: 'salads', label: 'Fresh Salads', keywords: ['salad', 'salads'] },
    { id: 'desserts', label: 'Signature Desserts', keywords: ['dessert', 'desserts', 'cake', 'pastry', 'sweet'] },
    { id: 'beverages', label: 'Beverages', keywords: ['beverage', 'beverages', 'drink', 'drinks', 'juice', 'coffee', 'tea', 'lemonade'] },
];

export const DIETARY_OPTIONS = [
    { id: 'vegan', label: 'Vegan', keywords: ['vegan', 'plant-based', 'plant based'] },
    { id: 'gluten-free', label: 'Gluten-Free', keywords: ['gluten-free', 'gluten free'] },
    { id: 'organic', label: 'Organic', keywords: ['organic'] },
];

export const PRICE_MIN = 5;
export const PRICE_MAX = 100;

const normalize = (value) => (value || '').toLowerCase().trim();

const itemText = (item) => normalize(`${item.name} ${item.description} ${item.category}`);

export const matchesCategory = (item, selectedCategoryIds) => {
    if (!selectedCategoryIds.length || selectedCategoryIds.includes('all')) return true;
    const category = normalize(item.category);
    const text = itemText(item);
    return selectedCategoryIds.some((id) => {
        const option = CATEGORY_OPTIONS.find((c) => c.id === id);
        if (!option) return false;
        return option.keywords.some((kw) => category.includes(kw) || text.includes(kw));
    });
};

export const matchesDietary = (item, selectedDietaryIds) => {
    if (!selectedDietaryIds.length) return true;
    const text = itemText(item);
    return selectedDietaryIds.some((id) => {
        const option = DIETARY_OPTIONS.find((d) => d.id === id);
        if (!option) return false;
        return option.keywords.some((kw) => text.includes(kw));
    });
};

export const matchesPrice = (item, maxPrice) => {
    const price = Number(item.price);
    if (maxPrice >= PRICE_MAX) return price >= PRICE_MIN;
    return price >= PRICE_MIN && price <= maxPrice;
};

export const matchesSearch = (item, query) => {
    const q = normalize(query);
    if (!q) return true;
    return itemText(item).includes(q);
};

export const filterFoodItems = (items, { search = '', categories = ['all'], maxPrice = PRICE_MAX, dietary = [] } = {}) =>
    items.filter(
        (item) =>
            matchesSearch(item, search) &&
            matchesCategory(item, categories) &&
            matchesDietary(item, dietary) &&
            matchesPrice(item, maxPrice)
    );

export const defaultFilters = () => ({
    categories: ['all'],
    maxPrice: PRICE_MAX,
    dietary: [],
});
