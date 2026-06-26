import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import { Search, SlidersHorizontal, RefreshCcw, LayoutGrid } from 'lucide-react';
import { ProductSkeleton } from '../components/LoadingIndicator.jsx';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories');
      if (response.ok) {
        const body = await response.json();
        setCategories(body.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Fetch Catalog Products
  const fetchCatalog = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating) params.append('minRating', minRating);
      if (isLoadMore && nextCursor) params.append('cursor', nextCursor);
      params.append('limit', '8');

      const response = await fetch(`/api/products/catalog?${params.toString()}`);
      if (response.ok) {
        const body = await response.json();
        const newProducts = body.data.products || [];
        setProducts(isLoadMore ? [...products, ...newProducts] : newProducts);
        setNextCursor(body.data.nextCursor || null);
      }
    } catch (err) {
      console.error('Failed to load catalog:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCatalog();
  }, []);

  // Handle filter submission
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchCatalog(false);
  };

  const handleReset = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setTimeout(() => {
      fetchCatalog(false);
    }, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-mono text-soft-ash">
      
      {/* Search Header Banner */}
      <div className="flex items-center gap-3 border-b border-acid/20 pb-4 mb-8">
        <LayoutGrid className="h-6 w-6 text-acid animate-pulse" />
        <h2 className="font-display font-black text-xl tracking-widest text-acid">
          CATALOG_DIRECTORY
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters HUD Panel */}
        <aside className="w-full lg:w-72 bg-sludge border border-acid/20 p-5 rounded clip-chamfer flex flex-col justify-between shrink-0 h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-acid/15 pb-2">
            <span className="text-xs font-bold text-f0f0f0 flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-acid" />
              SYSTEM_FILTERS
            </span>
            <button 
              onClick={handleReset} 
              className="text-[10px] text-blaze hover:underline flex items-center gap-1 transition-all"
            >
              <RefreshCcw className="h-3 w-3" /> RESET
            </button>
          </div>

          <form onSubmit={handleFilterSubmit} className="space-y-5 text-xs">
            {/* Semantic AI Prompt Search */}
            <div className="space-y-2">
              <label className="text-[10px] text-acid/70 uppercase">01_Vector_Search_Prompt</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. glowing lens..."
                  className="w-full bg-void border border-acid/30 hover:border-acid focus:border-acid px-3 py-2.5 pl-8 rounded text-f0f0f0 outline-none text-xs transition-colors"
                />
                <Search className="absolute left-2.5 top-3 h-3.5 w-3.5 text-soft-ash/60" />
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-[10px] text-acid/70 uppercase">02_Sludge_Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-void border border-acid/30 hover:border-acid focus:border-acid px-2.5 py-2.5 rounded text-f0f0f0 outline-none text-xs transition-colors"
              >
                <option value="">// ALL CLASSIFICATIONS</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Price limits */}
            <div className="space-y-2">
              <label className="text-[10px] text-acid/70 uppercase">03_Credits_Bound</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="MIN"
                  className="w-1/2 bg-void border border-acid/30 px-2 py-2 rounded text-f0f0f0 text-center outline-none text-xs"
                />
                <span className="text-acid/55">-</span>
                <input 
                  type="number" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="MAX"
                  className="w-1/2 bg-void border border-acid/30 px-2 py-2 rounded text-f0f0f0 text-center outline-none text-xs"
                />
              </div>
            </div>

            {/* Minimum rating */}
            <div className="space-y-2">
              <label className="text-[10px] text-acid/70 uppercase">04_Trust_Rating</label>
              <select 
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full bg-void border border-acid/30 px-2.5 py-2.5 rounded text-f0f0f0 outline-none text-xs"
              >
                <option value="">// ANY SECURITY RATING</option>
                <option value="4">4.0+ SECURE STARS</option>
                <option value="3">3.0+ STABLE STARS</option>
                <option value="2">2.0+ BASIC STARS</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-acid text-void font-display font-black text-xs tracking-wider rounded shadow-acid hover:shadow-acid-intense active:scale-95 transition-all"
            >
              RUN_SEARCH_UPLINK
            </button>
          </form>
        </aside>

        {/* Catalog grid viewport */}
        <main className="flex-grow space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 border border-acid/10 rounded bg-sludge/20">
              <p className="font-mono text-sm text-soft-ash/60">// NO RECORDS MATCHING QUERY COEFFICIENTS FOUND</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {/* Cursor "Load More" triggers */}
              {nextCursor && (
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => fetchCatalog(true)}
                    disabled={loadingMore}
                    className="px-6 py-3 border border-acid text-acid hover:bg-acid/15 font-display font-black text-xs tracking-widest rounded disabled:opacity-50 disabled:pointer-events-none transition-all"
                  >
                    {loadingMore ? 'DOWNLOADING_DATA_PACKETS...' : 'FETCH_MORE_RECORDS'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>

      </div>
    </div>
  );
}
