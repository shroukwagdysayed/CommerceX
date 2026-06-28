import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import ProductCard from '../../components/ProductCard';
import type { Product } from '../../types/product';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await apiClient.get('/products');
        if (data && data.success) {
          setProducts(data.data);
        } else {
          setError('Failed to load products');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'An error occurred while fetching products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Dynamically compute unique categories from fetched products
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">Discover Products</h1>
        <p className="text-slate-400">Browse through our catalogue of innovative tech products.</p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="gradient-text text-xl font-bold animate-pulse">Loading catalogue...</div>
        </div>
      ) : error ? (
        <div className="glass-card p-12 text-center rounded-2xl max-w-lg mx-auto">
          <h3 className="text-red-400 text-lg font-bold mb-2">Unable to retrieve products</h3>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      ) : (
        /* Filter and Search Layout */
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Sidebar Filters */}
          <aside className="glass-card p-6 w-full lg:w-[260px] lg:sticky lg:top-[90px] rounded-2xl">
            <div className="mb-6">
              <h3 className="text-sm font-bold tracking-wider text-slate-300 uppercase mb-3 pb-2 border-b border-white/8">
                Search
              </h3>
              <input 
                type="text" 
                placeholder="Search gear..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="form-control w-full text-sm py-2.5 px-3.5"
              />
            </div>

            <div>
              <h3 className="text-sm font-bold tracking-wider text-slate-300 uppercase mb-3 pb-2 border-b border-white/8">
                Categories
              </h3>
              <div className="flex flex-col gap-1.5">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`text-left px-3.5 py-2 rounded-lg text-sm transition-all duration-200 capitalize cursor-pointer ${
                      selectedCategory === category
                        ? 'bg-indigo-500/10 text-indigo-400 font-semibold'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <section className="flex-grow w-full">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-slate-400 glass-card rounded-2xl p-12">
                <h3 className="text-lg font-semibold mb-1">No products found</h3>
                <p className="text-sm">Try refining your search terms or category filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
};

export default Products;
