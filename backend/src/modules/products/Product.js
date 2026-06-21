import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({  
  url: { type: String, required: true },  
  altText: { type: String },  
  isPrimary: { type: Boolean, default: false }  
});

const productSchema = new mongoose.Schema({  
  sku: { type: String, required: true, unique: true, index: true, uppercase: true },  
  name: { type: String, required: true, trim: true },  
  slug: { type: String, required: true, unique: true, lowercase: true },  
  description: { type: String, required: true },  
  price: { type: Number, required: true, index: true, min: 0 },  
  compareAtPrice: { type: Number, min: 0 }, // Used for strike-through "Sale" pricing  
    
  inventory: {  
    countInStock: { type: Number, required: true, min: 0, default: 0 },  
    lowStockThreshold: { type: Number, default: 5 } // Triggers the "Hazard Yellow" warning  
  },  
    
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },  
  tags: [{ type: String, lowercase: true }], // e.g., ["cyberpunk", "glow", "mechanical"]  
  images: [imageSchema],  
    
  dimensions: {  
    length: Number,  
    width: Number,  
    height: Number,  
    weight: Number  
  },  
    
  reviews: {  
    averageRating: { type: Number, default: 0, min: 0, max: 5 },  
    totalReviews: { type: Number, default: 0 }  
  },

  // AI Discovery / Atlas Vector Search Integration  
  searchVector: {   
    type: [Number]
  },  
    
  isActive: { type: Boolean, default: true } // Soft delete / Hide from store  
}, { timestamps: true });

// Basic text index for standard queries when vector search is not configured
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Product', productSchema);
