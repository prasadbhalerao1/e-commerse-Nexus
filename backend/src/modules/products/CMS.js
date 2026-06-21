import mongoose from 'mongoose';

const cmsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'homepage' },
  heroBanner: {
    title: { type: String, default: 'PROJECT NEXUS UPLINK' },
    subtitle: { type: String, default: 'Cybernetic augmentations and terminal rig supplies.' },
    imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800' },
    ctaText: { type: String, default: 'INITIALIZE SYSTEM' }
  },
  featuredProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

export default mongoose.model('CMS', cmsSchema);
