import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/modules/users/User.js';
import Category from './src/modules/products/Category.js';
import Product from './src/modules/products/Product.js';
import Coupon from './src/modules/orders/Coupon.js';
import Cart from './src/modules/orders/Cart.js';
import { hashPassword } from './src/core/security/bcrypt.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecom-nexus';

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Database connected.');

    // Clear existing collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await Cart.deleteMany({});
    console.log('Cleared existing collections.');

    // Password hash (shared)
    const password = await hashPassword('password123');
    
    // Seed default users of three role tiers
    const superadmin = await User.create({
      firstName: 'Neo',
      lastName: 'Superadmin',
      email: 'admin@nexus.io',
      password,
      role: 'superadmin'
    });

    const editor = await User.create({
      firstName: 'Trinity',
      lastName: 'Editor',
      email: 'editor@nexus.io',
      password,
      role: 'editor'
    });

    const user = await User.create({
      firstName: 'Morpheus',
      lastName: 'User',
      email: 'user@nexus.io',
      password,
      role: 'user'
    });

    // Initialize user carts
    await Cart.create({ user: superadmin._id, items: [] });
    await Cart.create({ user: editor._id, items: [] });
    await Cart.create({ user: user._id, items: [] });

    console.log('Users seeded:');
    console.log('- Superadmin: admin@nexus.io (pwd: password123)');
    console.log('- Editor: editor@nexus.io (pwd: password123)');
    console.log('- User: user@nexus.io (pwd: password123)');

    // Seed Categories
    const cyberware = await Category.create({
      name: 'Cybernetic Augments',
      slug: 'cybernetic-augments',
      description: 'Physical augmentations to enhance data throughput.'
    });

    const decks = await Category.create({
      name: 'Cyber Decks',
      slug: 'cyber-decks',
      description: 'Heavy duty hacker decks running radioactive payloads.'
    });

    const sludge = await Category.create({
      name: 'Radioactive Waste',
      slug: 'radioactive-waste',
      description: 'Pure neon chemicals for reactor cores.'
    });

    console.log('Categories seeded.');

    // Seed Products (using Neon Color constraints)
    const p1 = await Product.create({
      sku: 'NEX-AUG-GLOW',
      name: 'Ocular Bio-Lens (Acid Glow)',
      slug: 'ocular-bio-lens-acid-glow',
      description: 'Superimpose real-time terminal telemetry directly onto your retina. Emits Acid Green radiation. Built for terminal deck runners.',
      price: 249.99,
      compareAtPrice: 299.99,
      inventory: { countInStock: 8, lowStockThreshold: 3 },
      category: cyberware._id,
      tags: ['cyberpunk', 'glow', 'augment', 'acid-green'],
      images: [
        { url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=300', altText: 'Acid Bio-Lens Primary', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=300', altText: 'Acid Bio-Lens Angle' }
      ]
    });

    const p2 = await Product.create({
      sku: 'NEX-DEC-SLUDGE',
      name: 'Abyssal Sludge Hacking Rig',
      slug: 'abyssal-sludge-hacking-rig',
      description: 'Handheld modular cyber-deck. Framed in military-grade polymer with Abyssal Sludge finish. Powered by dual plutonium batteries.',
      price: 1250.00,
      inventory: { countInStock: 2, lowStockThreshold: 1 },
      category: decks._id,
      tags: ['cyberpunk', 'deck', 'rig', 'sludge'],
      images: [
        { url: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?q=80&w=300', altText: 'Abyssal Sludge Rig Primary', isPrimary: true }
      ]
    });

    const p3 = await Product.create({
      sku: 'NEX-WST-NEON',
      name: 'Liquid Reactor Fuel (Hazard Yellow)',
      slug: 'liquid-reactor-fuel-hazard-yellow',
      description: 'Highly concentrated coolant fluid for heavy computing cores. Flashes bright Hazard Yellow under UV exposure. Extreme thermal dissipation.',
      price: 89.50,
      compareAtPrice: 110.00,
      inventory: { countInStock: 45, lowStockThreshold: 10 },
      category: sludge._id,
      tags: ['coolant', 'reactor', 'yellow', 'hazard'],
      images: [
        { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300', altText: 'Hazard Yellow Coolant', isPrimary: true }
      ]
    });

    const p4 = await Product.create({
      sku: 'NEX-AUG-BLAZE',
      name: 'Blaze Orange Synaptic Link',
      slug: 'blaze-orange-synaptic-link',
      description: 'Intravenous wiring upgrade for sub-millisecond reaction speeds. Emits Blaze Orange alerts under neural load.',
      price: 599.00,
      inventory: { countInStock: 5, lowStockThreshold: 2 },
      category: cyberware._id,
      tags: ['synapse', 'neural', 'blaze', 'orange'],
      images: [
        { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300', altText: 'Blaze Orange Link', isPrimary: true }
      ]
    });

    console.log('Products seeded.');

    // Seed Coupons
    await Coupon.create({
      code: 'NEXUS20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 100,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await Coupon.create({
      code: 'HAZARD50',
      discountType: 'fixed',
      discountValue: 50,
      minOrderValue: 200,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    });

    console.log('Coupons seeded.');
    console.log('Seeding complete. Exiting.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
