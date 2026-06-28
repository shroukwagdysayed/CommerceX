import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import type { Product } from '../../types/product';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!id) return;
      try {
        const { data } = await apiClient.get(`/products/${id}`);
        if (data && data.success) {
          setProduct(data.data);
        } else {
          setError('Failed to load product details');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'An error occurred while fetching details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!product) return;

    setLocalLoading(true);
    const success = await addToCart(product._id, qty);
    setLocalLoading(false);

    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="gradient-text text-xl font-bold animate-pulse">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-red-400 text-xl font-bold mb-4">Product Not Found</h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          {error || 'The product you are looking for does not exist or has been removed.'}
        </p>
        <Link to="/products" className="btn-primary">Back to Products</Link>
      </div>
    );
  }

  // Create specs dynamically from the product object properties
  const specs = [
    `Brand: ${product.brand}`,
    `Category: ${product.category}`,
    `Status: ${product.stock > 0 ? 'In Stock' : 'Out of stock'}`,
    `Stock Level: ${product.stock} items left`,
  ];

  const primaryImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';

  return (
    <div>
      <Link to="/products" className="inline-flex items-center gap-2 mb-8 text-slate-400 font-medium hover:text-indigo-400 transition-colors">
        &larr; Back to collection
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        {/* Product Image Showcase */}
        <div className="glass-card p-6 flex justify-center items-center overflow-hidden rounded-3xl">
          <img 
            src={primaryImage} 
            alt={product.title} 
            className="w-full rounded-2xl object-cover max-h-[500px] shadow-lg bg-black/10"
          />
        </div>

        {/* Product Details Section */}
        <div>
          <span className="text-indigo-400 font-bold uppercase text-xs tracking-wider mb-2 block">
            {product.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tight">{product.title}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-extrabold text-slate-100">
              ${product.price.toFixed(2)}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-medium text-base">
              ★ <span className="text-slate-400 text-sm">({product.rating.toFixed(1)})</span>
            </div>
          </div>

          <p className="text-slate-400 leading-relaxed text-lg mb-8">
            {product.description}
          </p>

          {/* Specs List */}
          <div className="mb-8">
            <h4 className="text-slate-200 font-bold mb-3">Specifications</h4>
            <ul className="list-disc pl-5 text-slate-400 flex flex-col gap-2 capitalize">
              {specs.map((spec, i) => (
                <li key={i}>{spec}</li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 items-center border-t border-white/8 pt-8">
            <div className="flex items-center border border-white/8 rounded-lg overflow-hidden bg-white/[0.01]">
              <button 
                onClick={() => setQty(q => Math.max(1, q - 1))}
                disabled={localLoading}
                className="px-4 py-2.5 bg-white/[0.02] hover:bg-white/[0.08] active:bg-white/[0.02] transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="px-5 py-2.5 font-bold min-w-[50px] text-center">
                {qty}
              </span>
              <button 
                onClick={() => setQty(q => q + 1)}
                disabled={localLoading}
                className="px-4 py-2.5 bg-white/[0.02] hover:bg-white/[0.08] active:bg-white/[0.02] transition-colors cursor-pointer"
              >
                +
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="btn-primary flex-grow py-3 cursor-pointer"
              disabled={product.stock === 0 || localLoading}
            >
              {product.stock === 0 ? 'Out of Stock' : added ? '✓ Added to Cart' : localLoading ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
