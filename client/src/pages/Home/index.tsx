import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import ProductCard from '../../components/ProductCard';
import type { Product } from '../../types/product';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const featuredProducts = products.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 text-center rounded-3xl mb-16 border border-white/[0.03] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12)_0%,transparent_70%)]">
        <div className="max-w-3xl mx-auto px-6">
          <span className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 inline-block">
            Next Generation E-Commerce
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
            Discover Premium <br/>
            <span className="gradient-text">Future-Ready Tech</span>
          </h1>
          <p className="text-base md:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
            Welcome to Galaxy. Elevate your everyday setup with our meticulously curated collection of high-performance gear and smart accessories.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/products" className="btn-primary px-8 py-3.5">
              Shop Collection
            </Link>
            <a href="#featured" className="btn-secondary px-8 py-3.5">
              View Featured
            </a>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Featured Gear</h2>
            <p className="text-slate-400">Our most popular performance-tested products.</p>
          </div>
          <Link to="/products" className="text-indigo-400 font-semibold flex items-center gap-1 hover:text-indigo-300 transition-colors">
            See All Products &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="gradient-text text-xl font-bold animate-pulse">Loading featured gear...</div>
          </div>
        ) : error ? (
          <div className="glass-card p-12 text-center rounded-2xl max-w-lg mx-auto">
            <h3 className="text-red-400 text-lg font-bold mb-2">Unable to retrieve products</h3>
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl text-slate-400">
            <h3 className="text-lg font-semibold">No products found</h3>
            <p className="text-sm">Seed the database or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
