'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, RotateCcw, X, ShoppingBag } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('default');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync category filter from URL search params
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) {
      setSelectedCategories([urlCategory]);
    } else {
      setSelectedCategories([]);
    }
  }, [searchParams]);

  // Handlers
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSortBy('default');
    router.replace('/products'); // clear URL search params
  };

  // Filter & Sort Logic
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.includes(product.category);

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') {
      // Dry sweets have price 0, put them first or sort by category
      return a.price - b.price;
    }
    if (sortBy === 'price-desc') {
      return b.price - a.price;
    }
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    return 0; // Default sorting (original order)
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col space-y-2 border-b border-border pb-6">
        <h1 className="font-heading text-3xl sm:text-4xl text-primary font-extrabold tracking-tight">
          Our Mithai Catalog
        </h1>
        <p className="text-xs sm:text-sm text-brown font-body">
          Explore our collection of authentic sweets, custom boxes, and savory treats, handcrafted fresh to order.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* DESKTOP SIDEBAR FILTER */}
        <aside className="hidden lg:block w-64 bg-white border border-border rounded-xl p-5 space-y-6 flex-shrink-0 sticky top-24">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-cinzel text-xs uppercase tracking-wider text-primary-deep font-bold">Filters</h2>
            <button 
              onClick={handleClearFilters}
              className="text-[10px] uppercase font-cinzel font-bold text-brown hover:text-primary flex items-center transition-colors duration-200"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </button>
          </div>

          {/* Categories checkboxes */}
          <div className="space-y-3">
            <h3 className="font-cinzel text-[11px] uppercase tracking-wider text-brown font-semibold">Categories</h3>
            <div className="space-y-2.5">
              {CATEGORIES.map((cat) => (
                <label key={cat.id} className="flex items-center space-x-2.5 text-xs text-primary-deep font-body font-semibold cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span className="group-hover:text-primary transition-colors">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort selection */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="font-cinzel text-[11px] uppercase tracking-wider text-brown font-semibold">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs bg-cream/30 border border-border rounded-md p-2 font-body text-primary-deep focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </aside>

        {/* CATALOG GRID */}
        <div className="flex-1 w-full space-y-6">
          {/* Top Search bar & Mobile filter button */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brown" />
              <input
                type="text"
                placeholder="Search sweet names or ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-border rounded-lg text-primary-deep placeholder-brown/60 font-body focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-blush/50 text-brown hover:text-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-1.5 px-4 py-2.5 bg-primary text-cream text-xs uppercase tracking-wider font-cinzel rounded-lg shadow-sm hover:bg-primary-deep"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Active filter badges */}
          {(selectedCategories.length > 0 || searchQuery || sortBy !== 'default') && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] text-brown uppercase font-cinzel font-semibold tracking-wider mr-1">
                Active:
              </span>
              {selectedCategories.map((catId) => {
                const catObj = CATEGORIES.find((c) => c.id === catId);
                return (
                  <span
                    key={catId}
                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blush text-primary font-body text-xs font-semibold"
                  >
                    <span>{catObj ? catObj.name.split(' (')[0] : catId}</span>
                    <button onClick={() => handleCategoryToggle(catId)} className="hover:text-primary-deep">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
              {searchQuery && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blush text-primary font-body text-xs font-semibold">
                  <span>Search: &quot;{searchQuery}&quot;</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-primary-deep">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {sortBy !== 'default' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blush text-primary font-body text-xs font-semibold">
                  <span>Sort: {sortBy === 'price-asc' ? 'Price ↑' : sortBy === 'price-desc' ? 'Price ↓' : 'Name A-Z'}</span>
                  <button onClick={() => setSortBy('default')} className="hover:text-primary-deep">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-[10px] text-primary font-semibold hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Grid Layout */}
          {sortedProducts.length === 0 ? (
            /* Empty Grid State */
            <div className="p-12 bg-white rounded-xl border border-border shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blush flex items-center justify-center text-primary">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-cinzel text-base text-primary-deep font-bold">No sweets found</h3>
                <p className="text-xs text-brown font-body mt-1 max-w-sm">
                  We couldn&apos;t find any items matching your selected criteria. Try adjusting filters or searching different keywords.
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="btn-gold py-2 px-5 text-[10px] uppercase tracking-widest"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <motion.div
                  layout
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE DRAWER FILTER */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 bg-cream rounded-t-2xl shadow-2xl z-50 p-6 space-y-6 max-h-[85vh] overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border pb-3.5">
                <h2 className="font-cinzel text-sm uppercase tracking-wider text-primary-deep font-bold">Filter Options</h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-full hover:bg-blush text-primary-deep"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile categories */}
              <div className="space-y-3">
                <h3 className="font-cinzel text-xs uppercase tracking-wider text-brown font-semibold">Categories</h3>
                <div className="space-y-3.5">
                  {CATEGORIES.map((cat) => (
                    <label key={cat.id} className="flex items-center space-x-3 text-xs text-primary-deep font-body font-semibold cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => handleCategoryToggle(cat.id)}
                        className="rounded border-border text-primary focus:ring-primary w-5 h-5 cursor-pointer"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile sort */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h3 className="font-cinzel text-xs uppercase tracking-wider text-brown font-semibold">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full text-xs bg-white border border-border rounded-md p-2.5 font-body text-primary-deep focus:outline-none"
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>

              {/* Mobile Actions */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 py-3 text-center border border-border text-xs uppercase tracking-wider font-cinzel rounded-lg hover:bg-blush/35 transition-colors font-bold text-brown"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 text-center bg-primary text-white text-xs uppercase tracking-wider font-cinzel rounded-lg hover:bg-primary-deep font-bold"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductCatalog() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-cinzel text-xs uppercase tracking-wider text-brown">Loading Sweet Catalog...</p>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
