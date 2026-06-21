import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({  
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },  
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
  rating: { type: Number, required: true, min: 1, max: 5 },  
  title: { type: String, required: true, trim: true },  
  comment: { type: String, required: true },  
  images: [{ type: String }], // Image URLs
  isVerifiedPurchase: { type: Boolean, default: false }  
}, { timestamps: true });

// Prevent multiple reviews from the same user on the same product  
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
