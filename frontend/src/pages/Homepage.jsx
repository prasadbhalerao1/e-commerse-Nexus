import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { Terminal, Shield, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProductSkeleton } from '../components/LoadingIndicator.jsx';

export default function Homepage() {
  const [cms, setCms] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCMS = async () => {
    try {
      const response = await fetch('/api/cms');
      if (response.ok) {
        const body = await response.json();
        setCms(body.data.cms);
        setFeatured(body.data.cms?.featuredProducts || []);
      }
    } catch (err) {
      console.error('Failed to load CMS parameters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCMS();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Dynamic CMS Hero Section */}
      <section className="relative min-h-[500px] flex items-center justify-center border-b border-acid/20 overflow-hidden bg-void">
        {/* Pulsing neon background lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0c0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0c0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1 px-3 py-1 border border-acid/30 rounded-full bg-acid/5 text-acid font-mono text-xs uppercase"
          >
            <Terminal className="h-3.5 w-3.5" />
            SECURE LINK ESTABLISHED // SYSTEM LIVE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-black text-4xl sm:text-6xl text-f0f0f0 tracking-wider hover-glitch uppercase"
            style={{ textShadow: '0 0 15px rgba(57, 255, 20, 0.3)' }}
          >
            {cms?.heroBanner?.title || 'PROJECT NEXUS // UPLINK'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-sans text-soft-ash text-base sm:text-xl max-w-2xl mx-auto"
          >
            {cms?.heroBanner?.subtitle || 'Cybernetic augmentations, heavy hacker rigs, and pure neon cooling reagents.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-4"
          >
            <Link 
              to="/catalog" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-acid text-void font-display font-black text-sm tracking-widest rounded-full shadow-acid-intense hover:scale-105 active:scale-95 transition-all"
            >
              {cms?.heroBanner?.ctaText || 'INITIALIZE SYSTEM'}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Enclave */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-acid/10 pb-4">
          <div className="flex items-center gap-2 font-display text-lg font-black tracking-widest text-acid">
            <Sparkles className="h-5 w-5 animate-pulse" />
            FEATURED_AUGMENTS
          </div>
          <Link 
            to="/catalog" 
            className="font-mono text-xs text-soft-ash hover:text-acid flex items-center gap-1 transition-colors"
          >
            // VIEW ALL IN CATALOG <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 font-mono text-sm text-soft-ash/60">
            // NO ACTIVE FEATURED SPECIMENS LISTED IN MAIN SYSTEM
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Quality Grid Info blocks */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 font-mono text-soft-ash">
        <div className="p-6 bg-sludge border border-acid/10 rounded hover:border-acid/30 transition-colors">
          <h3 className="font-display font-black text-xs text-acid mb-2">// 01_VECTOR_SEARCH</h3>
          <p className="text-xs text-soft-ash/70 leading-relaxed">
            Query catalog using natural language prompts matched against semantic vectors in real-time.
          </p>
        </div>
        <div className="p-6 bg-sludge border border-acid/10 rounded hover:border-acid/30 transition-colors">
          <h3 className="font-display font-black text-xs text-hazard mb-2">// 02_WEBSOCKET_SYNC</h3>
          <p className="text-xs text-soft-ash/70 leading-relaxed">
            Connected client datapads get real-time stock alert pings and visitor view tracking immediately.
          </p>
        </div>
        <div className="p-6 bg-sludge border border-acid/10 rounded hover:border-acid/30 transition-colors">
          <h3 className="font-display font-black text-xs text-blaze mb-2">// 03_ENCRYPTED_UPLINK</h3>
          <p className="text-xs text-soft-ash/70 leading-relaxed">
            Stateless authentication using HttpOnly cookie security protocols protecting user sessions.
          </p>
        </div>
      </section>

    </div>
  );
}
