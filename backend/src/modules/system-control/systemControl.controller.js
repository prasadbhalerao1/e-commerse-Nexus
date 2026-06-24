import mongoose from 'mongoose';
import User from '../users/User.model.js';
import Category from '../products/Category.model.js';
import Product from '../products/Product.model.js';
import CMS from '../cms/CMS.model.js';
import Coupon from '../coupons/Coupon.model.js';
import Cart from '../cart/Cart.model.js';
import Order from '../orders/Order.model.js';
import Review from '../reviews/Review.model.js';
import { hashPassword } from '../../core/security/bcrypt.js';
import { runCartRecoveryJob } from '../../jobs/cartRecovery.js';
import { getIo } from '../notifications/socket.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../core/responses/ApiResponse.js';
import { BadRequestError, NotFoundError } from '../../core/errors.js';

// GET /api/system-control/health
export const deepHealthCheck = asyncHandler(async (req, res) => {
  const mongoConnectionState = mongoose.connection.readyState;
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  const io = getIo();
  const socketConnectedCount = io ? io.sockets.sockets.size : 0;
  
  // Aggregate DB stats
  const usersCount = await User.countDocuments({});
  const productsCount = await Product.countDocuments({});
  const ordersCount = await Order.countDocuments({});
  const activeCarts = await Cart.countDocuments({ items: { $exists: true, $not: { $size: 0 } } });

  const healthData = {
    status: 'Operational',
    uptime: Math.round(process.uptime()),
    timestamp: new Date(),
    database: {
      status: states[mongoConnectionState] || 'Unknown',
      users: usersCount,
      products: productsCount,
      orders: ordersCount,
      activeCarts
    },
    websockets: {
      status: io ? 'Active' : 'Inactive',
      activeConnections: socketConnectedCount
    },
    resources: {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }
  };

  return res.status(200).json(
    new ApiResponse(200, healthData, 'Deep system telemetry completed successfully')
  );
});

// POST /api/system-control/seed
export const reseedDatabase = asyncHandler(async (req, res) => {
  // Clear existing collections
  await User.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Coupon.deleteMany({});
  await Cart.deleteMany({});
  await CMS.deleteMany({});
  await Order.deleteMany({});
  await Review.deleteMany({});

  const password = await hashPassword('password123');
  
  // Users
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

  const testUser = await User.create({
    firstName: 'Morpheus',
    lastName: 'Tester',
    email: 'test@example.com',
    password,
    role: 'user',
    addresses: [
      {
        street: '101 Cyber Expressway, Room 404',
        city: 'Neotropolis',
        state: 'Sector 9',
        zip: '99021',
        country: 'Neoterra',
        isDefault: true
      }
    ]
  });

  const buyer = await User.create({
    firstName: 'Apoc',
    lastName: 'Buyer',
    email: 'buyer@nexus.io',
    password,
    role: 'user',
    addresses: [
      {
        street: '88 Zion Core Drive',
        city: 'Zion City',
        state: 'Deep Subterranean',
        zip: '00001',
        country: 'FreeEarth',
        isDefault: true
      }
    ]
  });

  // Categories
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

  const tactical = await Category.create({
    name: 'Tactical Gear',
    slug: 'tactical-gear',
    description: 'Ballistic plating, thermal masking, and hazard protection suits.'
  });

  // Products
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
      { url: '/cyber_lens.png', altText: 'Acid Bio-Lens Primary', isPrimary: true }
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
      { url: '/cyber_deck.png', altText: 'Abyssal Sludge Rig Primary', isPrimary: true }
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
    sku: 'NEX-WST-DECAY',
    name: 'Decayed Reactor Rod (Out of Stock)',
    slug: 'decayed-reactor-rod-out-of-stock',
    description: 'Pruned fuel rods containing spent plutonium cores. Emits zero energy and is fully depleted of charge.',
    price: 15.00,
    inventory: { countInStock: 0, lowStockThreshold: 2 },
    category: sludge._id,
    tags: ['spent', 'decayed', 'trash'],
    images: [
      { url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=300', altText: 'Depleted fuel rod', isPrimary: true }
    ]
  });

  const p5 = await Product.create({
    sku: 'NEX-TAC-ARMOR',
    name: 'Subdermal Nano-Plating',
    slug: 'subdermal-nano-plating',
    description: 'Flexible grid-based microscopic carbon plates injected beneath the epidermal layer. High impact resistance, hazard protection, lightweight.',
    price: 850.00,
    compareAtPrice: 999.00,
    inventory: { countInStock: 15, lowStockThreshold: 5 },
    category: tactical._id,
    tags: ['combat', 'armor', 'tactical', 'subdermal'],
    images: [
      { url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300', altText: 'Subdermal Plating', isPrimary: true }
    ]
  });

  // User Carts
  await Cart.create({
    user: testUser._id,
    items: [
      { product: p1._id, quantity: 2, priceAtAdded: p1.price },
      { product: p2._id, quantity: 1, priceAtAdded: p2.price },
      { product: p4._id, quantity: 1, priceAtAdded: p4.price }
    ]
  });

  await Cart.create({ user: superadmin._id, items: [] });
  await Cart.create({ user: editor._id, items: [] });
  await Cart.create({ user: buyer._id, items: [] });

  // Coupons
  await Coupon.create({
    code: 'NEXUS20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 100,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  await Coupon.create({
    code: 'HAZARD50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValue: 200,
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  });

  // CMS
  await CMS.create({
    key: 'homepage',
    heroBanner: {
      title: 'PROJECT NEXUS // PLAYGROUND ACTIVE',
      subtitle: 'System Control Room has reinitialized the database cluster.',
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800',
      ctaText: 'CHECK CATALOG'
    },
    featuredProducts: [p1._id, p2._id, p5._id || p3._id]
  });

  return res.status(200).json(
    new ApiResponse(200, null, 'Mainframe database reseeded successfully')
  );
});

// POST /api/system-control/sweep
export const triggerCartRecoverySweep = asyncHandler(async (req, res) => {
  // Run sweep manually
  await runCartRecoveryJob();
  
  return res.status(200).json(
    new ApiResponse(200, null, 'Abandoned cart recovery scan sweep completed')
  );
});

// POST /api/system-control/webhook
export const mockWebhookUpdate = asyncHandler(async (req, res) => {
  const { orderNumber, status = 'Completed' } = req.body;
  if (!orderNumber) {
    throw new BadRequestError('orderNumber parameter is required');
  }

  const order = await Order.findOne({ orderNumber });
  if (!order) {
    throw new NotFoundError('Order matching parameter ref not found');
  }

  order.payment.status = status;
  if (status === 'Completed') {
    order.payment.transactionId = `TX-WEBHOOK-${Date.now()}`;
  }
  await order.save();

  return res.status(200).json(
    new ApiResponse(200, { order }, `Stripe mock webhook successfully updated order payment status to ${status}`)
  );
});
