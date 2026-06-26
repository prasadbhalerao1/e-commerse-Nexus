import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import io from 'socket.io-client';
import { Star, ShieldAlert, Users, ShoppingCart, MessageSquare, ShieldCheck, ArrowLeft } from 'lucide-react';
import { SkeletonBlock } from '../components/LoadingIndicator.jsx';

export default function ProductDetails() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spectators, setSpectators] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState('');
  const [postingReview, setPostingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Q&A States
  const [qaInput, setQaInput] = useState('');
  const [qaList, setQaList] = useState([]);

  useEffect(() => {
    if (product) {
      if (product.slug.includes('lens')) {
        setQaList([
          { question: 'Is this eyepiece compatible with standard bio-lenses?', answer: 'YES. Standard Neuro-Link interface (v4.2) supported.' },
          { question: 'Can I overlay terminal feeds directly?', answer: 'Correct. Direct terminal socket streams can be piped to the ocular buffer.' }
        ]);
      } else if (product.slug.includes('rig')) {
        setQaList([
          { question: 'What is the runtime capacity on a single recharge?', answer: 'Approximately 72 hours of uninterrupted vector processing.' }
        ]);
      } else {
        setQaList([
          { question: 'Does this augment emit ionizing radiation?', answer: 'Zero emission detected on external Geiger nodes.' }
        ]);
      }
    }
  }, [product]);

  const handleAskQuestion = () => {
    if (!qaInput.trim()) return;
    const newQuestion = qaInput;
    setQaList((prev) => [
      ...prev,
      { question: newQuestion, answer: 'Node processing... Encrypting reply payload...' }
    ]);
    setQaInput('');

    setTimeout(() => {
      setQaList((prev) => {
        const updated = [...prev];
        const last = updated.find((q) => q.question === newQuestion);
        if (last) {
          last.answer = 'TRANSMISSION_ACKNOWLEDGED. Mainframe registers standard compliance. Verified safe operational parameters.';
        }
        return [...updated];
      });
    }, 2000);
  };

  const socketRef = useRef(null);

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`/api/products/slug/${slug}`);
      if (response.ok) {
        const body = await response.json();
        const pData = body.data.product;
        setProduct(pData);
        fetchReviews(pData._id);
        setupSocket(pData._id);
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId) => {
    try {
      const response = await fetch(`/api/reviews/${productId}`);
      if (response.ok) {
        const body = await response.json();
        setReviews(body.data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };
  const setupSocket = (productId) => {
    // Connect WebSockets
    const socket = io(import.meta.env.VITE_BACKEND_URL || window.location.origin);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinProduct', productId);
    });

    socket.on('spectatorCount', (count) => {
      setSpectators(count);
    });

    socket.on('stockUpdate', ({ productId: sProdId, count }) => {
      if (sProdId === productId) {
        setProduct((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            inventory: {
              ...prev.inventory,
              countInStock: count
            }
          };
        });
      }
    });
  };

  useEffect(() => {
    fetchProductDetails();

    return () => {
      if (socketRef.current && product) {
        socketRef.current.emit('leaveProduct', product._id);
        socketRef.current.disconnect();
      }
    };
  }, [slug]);

  const handleAdd = () => {
    if (!product) return;
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      slug: product.slug,
      image: product.images?.[activeImageIndex]?.url || product.images?.[0]?.url || '',
      countInStock: product.inventory?.countInStock || 0
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setPostingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const imgArray = reviewImages ? reviewImages.split(',').map((img) => img.trim()) : [];
      const response = await fetch(`/api/reviews/${product._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          title: reviewTitle,
          comment: reviewComment,
          images: imgArray
        })
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || 'Review upload failed');
      }

      setReviewSuccess('Review published successfully!');
      setReviewTitle('');
      setReviewComment('');
      setReviewImages('');
      fetchReviews(product._id);
      
      // Refresh product details for averageRating updates
      const updatedResponse = await fetch(`/api/products/slug/${slug}`);
      if (updatedResponse.ok) {
        const uBody = await updatedResponse.json();
        setProduct(uBody.data.product);
      }
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setPostingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 font-mono text-soft-ash space-y-12 animate-pulse">
        {/* Back Link placeholder */}
        <SkeletonBlock height="h-4" width="w-28" />

        <div className="flex flex-col md:flex-row gap-10">
          {/* Image Panel placeholder */}
          <div className="w-full md:w-1/2 space-y-4">
            <SkeletonBlock height="aspect-square" rounded="rounded" shape="clip-chamfer" />
            <div className="flex gap-2">
              <SkeletonBlock height="h-16" width="w-16" />
              <SkeletonBlock height="h-16" width="w-16" />
            </div>
          </div>

          {/* Product details description placeholder */}
          <div className="w-full md:w-1/2 space-y-6">
            <div className="space-y-2">
              <SkeletonBlock height="h-3" width="w-20" />
              <SkeletonBlock height="h-8" width="w-3/4" />
              <SkeletonBlock height="h-4.5" width="w-40" />
            </div>
            
            {/* Spectator Active core counter */}
            <SkeletonBlock height="h-10.5" width="w-72" />

            <div className="py-4 border-t border-b border-acid/15">
              <SkeletonBlock height="h-8" width="w-28" />
            </div>

            <div className="space-y-2">
              <SkeletonBlock height="h-3" width="w-36" />
              <SkeletonBlock height="h-16" />
            </div>

            <SkeletonBlock height="h-12" width="w-64" rounded="rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center font-mono text-soft-ash space-y-4">
        <p>// PRODUCT RECORD OR UPLINK SLUG NOT FOUND IN LOGS</p>
        <Link to="/catalog" className="text-acid hover:underline flex items-center justify-center gap-1">
          <ArrowLeft className="h-4 w-4" /> BACK TO DIRECTORY
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [{ url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=600', altText: 'Stock Product Image' }];
  const hasLowStock = product.inventory?.countInStock > 0 && product.inventory.countInStock <= (product.inventory.lowStockThreshold || 5);
  const isOutOfStock = product.inventory?.countInStock === 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-mono text-soft-ash space-y-12">
      
      {/* Back to Catalog trigger */}
      <Link to="/catalog" className="inline-flex items-center gap-1 text-xs hover:text-acid transition-colors">
        <ArrowLeft className="h-4 w-4" /> // BACK_TO_CATALOG
      </Link>

      <div className="flex flex-col md:flex-row gap-10">
        
        {/* Carousel Image Panel */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className="relative aspect-square border border-acid/20 rounded bg-void overflow-hidden flex items-center justify-center group">
            <img 
              src={images[activeImageIndex]?.url} 
              alt={images[activeImageIndex]?.altText || product.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125 cursor-zoom-in"
            />
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="absolute top-4 left-4 px-2 py-0.5 text-xs font-arcade bg-hazard text-void font-bold shadow-hazard rounded-sm">
                SALE
              </span>
            )}
          </div>

          {/* Carousel thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded overflow-hidden border transition-all ${idx === activeImageIndex ? 'border-acid shadow-acid' : 'border-acid/20 hover:border-acid/60'}`}
                >
                  <img src={img.url} alt={img.altText || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product meta description panel */}
        <div className="w-full md:w-1/2 space-y-6">
          <div className="space-y-2">
            <span className="text-xs text-acid/60 tracking-wider">
              {product.category?.name?.toUpperCase() || 'HARDWARE'}
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-f0f0f0 uppercase tracking-wide">
              {product.name}
            </h2>
            <div className="flex items-center gap-3 text-xs opacity-60">
              <span>SKU: {product.sku}</span>
              <span>•</span>
              <span className="text-[10px] text-acid/80 bg-acid/5 px-2 py-0.5 rounded border border-acid/10">MODEL_CONNECTED</span>
            </div>
          </div>

          {/* Spectator Real-Time Active counter */}
          <div className="flex items-center gap-2 p-3 bg-sludge border border-acid/25 rounded-md text-xs w-fit">
            <Users className="h-4 w-4 text-acid animate-pulse" />
            <span className="font-bold text-acid">
              {spectators} {spectators === 1 ? 'RUNNER' : 'RUNNERS'} ACTIVE ON THIS DATAPAD
            </span>
          </div>

          <div className="border-t border-b border-acid/15 py-4 flex items-baseline gap-4">
            <span className="text-2xl font-arcade text-acid">${product.price.toFixed(2)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm font-arcade text-soft-ash line-through opacity-55">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-f0f0f0">// DESCRIPTION_SUMMARY:</h3>
            <p className="text-xs text-soft-ash/80 leading-relaxed font-sans">
              {product.description}
            </p>
          </div>

          {/* Stock state */}
          <div className="space-y-4 pt-2">
            {isOutOfStock ? (
              <div className="p-3 border border-blaze bg-blaze/5 text-xs rounded text-blaze font-bold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                STOCK DEPLENISHED. UPLINK ARCHIVED.
              </div>
            ) : (
              <>
                {hasLowStock && (
                  <div className="p-3 border border-hazard bg-hazard/5 text-xs rounded text-hazard font-bold flex items-center gap-2 animate-pulse">
                    <ShieldAlert className="h-4 w-4" />
                    WARNING: CRITICAL DECAY IN STORAGE ({product.inventory.countInStock} PIECES LEFT)
                  </div>
                )}
                
                <button
                  onClick={handleAdd}
                  className="w-full sm:w-64 py-3 bg-blaze text-void font-display font-black text-sm tracking-widest rounded shadow-blaze hover:shadow-blaze-intense hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  ACQUIRE_PRODUCT
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Review Enclave */}
      <div className="border-t border-acid/20 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Submit Review Form */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 font-display text-base font-black tracking-widest text-acid">
            <MessageSquare className="h-5 w-5" />
            FEEDBACK_LOGS
          </div>

          {user ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4 bg-sludge border border-acid/15 p-5 rounded clip-chamfer text-xs">
              <h3 className="text-xs font-bold text-f0f0f0 border-b border-acid/15 pb-2">// POST_NEW_FEEDBACK</h3>
              
              <div className="space-y-1">
                <label className="text-[10px] text-acid/80 uppercase">Rating Stars</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-void border border-acid/30 px-2 py-2 rounded text-f0f0f0 outline-none"
                >
                  <option value="5">★★★★★ (5 STARS - PERFECT)</option>
                  <option value="4">★★★★☆ (4 STARS - OPTIMAL)</option>
                  <option value="3">★★★☆☆ (3 STARS - STABLE)</option>
                  <option value="2">★★☆☆☆ (2 STARS - SLOW)</option>
                  <option value="1">★☆☆☆☆ (1 STAR - DECAYED)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-acid/80 uppercase">Feedback Title</label>
                <input 
                  type="text" 
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Excellent throughput!" 
                  required
                  className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-acid/80 uppercase">Comments Payload</label>
                <textarea 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows="4" 
                  placeholder="Detailed findings..." 
                  required
                  className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-acid/80 uppercase">Images (Comma Separated URLs)</label>
                <input 
                  type="text" 
                  value={reviewImages}
                  onChange={(e) => setReviewImages(e.target.value)}
                  placeholder="http://example.com/img1.jpg, http://example.com/img2.jpg" 
                  className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none"
                />
              </div>

              {reviewError && <div className="text-blaze text-[11px] font-bold">{reviewError}</div>}
              {reviewSuccess && <div className="text-acid text-[11px] font-bold">{reviewSuccess}</div>}

              <button 
                type="submit" 
                disabled={postingReview}
                className="w-full py-2 bg-acid text-void font-display font-black tracking-widest rounded disabled:opacity-50 transition-all hover:bg-acid/80"
              >
                {postingReview ? 'TRANSMITTING...' : 'COMMIT_FEEDBACK'}
              </button>
            </form>
          ) : (
            <div className="p-4 border border-acid/20 rounded text-center text-xs text-soft-ash/60">
              // UPLINK IDENTITY IN SESSION TO UPLOAD FEEDBACK
              <Link to="/auth" className="block text-acid hover:underline mt-2">LOGIN NOW</Link>
            </div>
          )}
        </div>

        {/* Right Side: Reviews Timeline List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-f0f0f0">// USER_FEEDBACK_TIMELINE</h3>

          {reviews.length === 0 ? (
            <div className="p-6 border border-acid/10 rounded text-center text-xs text-soft-ash/40">
              // NO FEEDBACK LOGS RECORDED ON THIS COMPONENT YET
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r._id} className="p-4 bg-sludge border border-acid/15 rounded clip-chamfer-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-f0f0f0">
                      {r.user?.firstName ? `${r.user.firstName.toUpperCase()} ${r.user.lastName ? r.user.lastName.toUpperCase() : ''}` : 'DECK_RUNNER'}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-hazard">
                      {[...Array(5)].map((_, idx) => (
                        <Star 
                          key={idx} 
                          className={`h-3 w-3 ${idx < r.rating ? 'fill-current text-hazard' : 'text-soft-ash/20'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Verified purchase status */}
                  {r.isVerifiedPurchase && (
                    <div className="inline-flex items-center gap-1 text-[9px] text-acid font-bold border border-acid/20 bg-acid/5 px-2 py-0.5 rounded-sm">
                      <ShieldCheck className="h-3 w-3 text-acid" /> VERIFIED_PURCHASER
                    </div>
                  )}

                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-soft-ash">{r.title.toUpperCase()}</h4>
                    <p className="text-xs text-soft-ash/70 leading-relaxed font-sans">{r.comment}</p>
                  </div>

                  {/* Review photos carousel preview */}
                  {r.images && r.images.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      {r.images.map((imgUrl, i) => (
                        <img 
                          key={i} 
                          src={imgUrl} 
                          alt="Review attachment" 
                          className="w-12 h-12 object-cover rounded border border-acid/15"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    {/* Community Q&A Section */}
    <div className="border-t border-acid/20 pt-10 space-y-6">
        <div className="flex items-center gap-2 font-display text-base font-black tracking-widest text-acid">
          <MessageSquare className="h-5 w-5" />
          COMMUNITY_Q&A_LOGS
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submit Question Form */}
          <div className="space-y-4">
            <div className="bg-sludge border border-acid/15 p-5 rounded clip-chamfer text-xs space-y-3">
              <h3 className="text-xs font-bold text-f0f0f0 border-b border-acid/15 pb-2">// SUBMIT_NEW_QUESTION</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Ask a community question..."
                  value={qaInput}
                  onChange={(e) => setQaInput(e.target.value)}
                  className="w-full bg-void border border-acid/30 px-3 py-2 rounded text-f0f0f0 outline-none focus:border-acid"
                />
                <button
                  type="button"
                  onClick={handleAskQuestion}
                  disabled={!qaInput.trim()}
                  className="w-full py-2 bg-acid text-void font-display font-black text-xs tracking-wider rounded disabled:opacity-40"
                >
                  BROADCAST_QUESTION
                </button>
              </div>
            </div>
          </div>

          {/* Q&A Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-f0f0f0">// Q&A_UPLINK_TIMELINE</h3>
            {qaList.length === 0 ? (
              <div className="p-6 border border-acid/10 rounded text-center text-xs text-soft-ash/40">
                // NO QUERY STACKS BROADCASTED FOR THIS COMPONENT
              </div>
            ) : (
              <div className="space-y-4">
                {qaList.map((qa, idx) => (
                  <div key={idx} className="p-4 bg-sludge border border-acid/15 rounded clip-chamfer-sm space-y-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-hazard font-bold">// QUESTION:</span>
                      <p className="text-f0f0f0 font-semibold">{qa.question}</p>
                    </div>
                    {qa.answer && (
                      <div className="pl-4 border-l-2 border-acid/40 space-y-1">
                        <span className="text-[10px] text-acid font-bold">// SECURE_NODE_RESPONSE:</span>
                        <p className="text-soft-ash/80 leading-relaxed font-sans">{qa.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
