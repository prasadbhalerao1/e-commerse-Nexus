import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { Star, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const primaryImage = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=300';
  const hasLowStock = product.inventory?.countInStock > 0 && product.inventory.countInStock <= (product.inventory.lowStockThreshold || 5);
  const isOutOfStock = product.inventory?.countInStock === 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      slug: product.slug,
      image: primaryImage,
      countInStock: product.inventory?.countInStock || 0
    });
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      className="group relative flex flex-col justify-between w-full h-full bg-sludge border border-acid/20 hover:border-acid hover:shadow-acid clip-chamfer p-4 transition-all duration-300 font-mono"
    >
      <Link to={`/products/${product.slug}`} className="flex flex-col h-full justify-between">
        
        {/* Visual Product Image Container */}
        <div className="relative w-full aspect-square mb-4 rounded bg-void overflow-hidden border border-acid/10 flex items-center justify-center">
          <img 
            src={primaryImage} 
            alt={product.name} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />

          {/* Dynamic Sale / Stock Badges */}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-arcade bg-hazard text-void font-bold shadow-hazard rounded-sm">
              SALE
            </span>
          )}

          {isOutOfStock ? (
            <span className="absolute inset-0 flex items-center justify-center bg-void/80 text-blaze font-display font-black text-sm tracking-widest">
              OUT_OF_STOCK
            </span>
          ) : hasLowStock ? (
            <span className="absolute top-2 right-2 px-2 py-0.5 text-[8px] bg-void border border-hazard text-hazard font-bold animate-pulse">
              LOW_STOCK: {product.inventory.countInStock}
            </span>
          ) : null}
        </div>

        {/* Product details */}
        <div className="flex-grow flex flex-col justify-between mb-4">
          <div className="space-y-1">
            {/* Category tag */}
            <span className="text-[10px] text-acid/60 tracking-wider">
              {product.category?.name?.toUpperCase() || 'EQUIPMENT'}
            </span>
            <h3 className="font-display text-sm font-bold text-f0f0f0 line-clamp-2 uppercase tracking-wide group-hover:text-acid transition-colors">
              {product.name}
            </h3>
          </div>

          <div className="flex items-center justify-between mt-3">
            {/* Prices (including comparative sale strikes) */}
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-xs font-arcade text-acid">${product.price.toFixed(2)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-[9px] font-arcade text-soft-ash line-through opacity-55">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Micro rating tracker */}
            {product.reviews?.totalReviews > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-hazard">
                <Star className="h-3 w-3 fill-current text-hazard" />
                <span>{product.reviews.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* "INSERT COIN" add cart trigger */}
        {!isOutOfStock && (
          <button 
            onClick={handleAdd}
            className="w-full py-2 bg-void border border-blaze text-blaze hover:bg-blaze hover:text-void font-display font-black text-xs tracking-widest rounded-full transition-all flex items-center justify-center gap-1.5 shadow-blaze hover:shadow-blaze-intense"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            // INSERT COIN
          </button>
        )}

      </Link>
    </motion.div>
  );
}
