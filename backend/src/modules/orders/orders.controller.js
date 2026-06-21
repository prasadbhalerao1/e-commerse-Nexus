import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import Order from './Order.model.js';
import Cart from '../cart/Cart.model.js';
import Coupon from '../coupons/Coupon.model.js';
import Product from '../products/Product.model.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../core/errors.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../core/responses/ApiResponse.js';
import mailService from '../../common/services/mail.service.js';
import { emitStockUpdate } from '../notifications/socket.js';

// --- CHECKOUT & ORDER MODULE ---
export const createOrder = asyncHandler(async (req, res) => {
  const { 
    guestEmail, 
    items, 
    shippingAddress, 
    billingAddress, 
    paymentMethod, 
    couponCode 
  } = req.body;

  if (!req.user && !guestEmail) {
    throw new BadRequestError('Email address is required for guest checkout');
  }

  let subtotal = 0;
  const processedItems = [];

  // Price calculations and inventory checks on the backend
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      throw new NotFoundError(`Product ${item.product} not found or inactive`);
    }

    if (product.inventory.countInStock < item.qty) {
      throw new BadRequestError(`Insufficient stock for product ${product.name}. Only ${product.inventory.countInStock} available`);
    }

    subtotal += product.price * item.qty;
    processedItems.push({
      product: product._id,
      name: product.name,
      sku: product.sku,
      qty: item.qty,
      priceAtPurchase: product.price
    });
  }

  let discountAmount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon) {
      if (coupon.expiresAt >= new Date() && 
          (coupon.usageLimit === null || coupon.timesUsed < coupon.usageLimit) && 
          subtotal >= coupon.minOrderValue) {
        
        appliedCoupon = coupon._id;
        if (coupon.discountType === 'percentage') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
        } else {
          discountAmount = coupon.discountValue;
        }
        
        // Cap discount amount to subtotal
        discountAmount = Math.min(discountAmount, subtotal);
        
        // Update coupon usage
        coupon.timesUsed += 1;
        await coupon.save();
      }
    }
  }

  const tax = subtotal * 0.08; // 8% sales tax
  const shippingCost = subtotal > 150 ? 0 : 10; // Free shipping above $150, else $10 flat rate
  const total = subtotal - discountAmount + tax + shippingCost;

  // Generate clean sequential/random order identifier
  const orderNumber = `NEX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Deduct inventory and emit real-time stock alert
  for (const item of items) {
    const updatedProduct = await Product.findByIdAndUpdate(
      item.product,
      { $inc: { 'inventory.countInStock': -item.qty } },
      { new: true }
    );
    if (updatedProduct) {
      emitStockUpdate(item.product, updatedProduct.inventory.countInStock);
    }
  }

  const order = await Order.create({
    orderNumber,
    user: req.user ? req.user._id : null,
    guestEmail: req.user ? undefined : guestEmail,
    items: processedItems,
    shippingAddress,
    billingAddress,
    payment: {
      method: paymentMethod,
      transactionId: `TX-${Date.now()}`,
      status: 'Completed' // Auto-approved in mock system
    },
    financials: {
      subtotal,
      tax,
      shippingCost,
      discountAmount,
      total
    },
    appliedCoupon,
    fulfillmentStatus: 'Unfulfilled'
  });

  // Clear user's DB cart if logged in
  if (req.user) {
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });
  }

  // Trigger mock transaction email
  await mailService.sendMail({
    to: req.user ? req.user.email : guestEmail,
    subject: `Order Confirmation: ${orderNumber}`,
    text: `Your order ${orderNumber} has been received! Total amount charged: $${total.toFixed(2)}`
  });

  return res.status(201).json(
    new ApiResponse(201, { order }, 'Order placed successfully')
  );
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json(
    new ApiResponse(200, { orders }, 'Orders history retrieved successfully')
  );
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id).populate('items.product', 'images slug');
  
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Authorize user to see their own order (or Admin / Editor)
  if (req.user.role === 'user' && order.user?.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('You are not authorized to view this order');
  }

  return res.status(200).json(
    new ApiResponse(200, { order }, 'Order retrieved successfully')
  );
});

// Admin Controllers
export const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });
  
  // Aggregate status counts for dashboard
  const statusCounts = await Order.aggregate([
    { $group: { _id: '$fulfillmentStatus', count: { $sum: 1 } } }
  ]);

  return res.status(200).json(
    new ApiResponse(200, { orders, statusCounts }, 'Admin orders fetched successfully')
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fulfillmentStatus, trackingNumber } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  order.fulfillmentStatus = fulfillmentStatus;
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }
  await order.save();

  // Send update notification email
  const emailRecipient = order.user ? (await mongoose.model('User').findById(order.user))?.email : order.guestEmail;
  if (emailRecipient) {
    await mailService.sendMail({
      to: emailRecipient,
      subject: `Order Update: ${order.orderNumber}`,
      text: `Your order ${order.orderNumber} status has changed to ${fulfillmentStatus}. Tracking ID: ${trackingNumber || 'N/A'}`
    });
  }

  return res.status(200).json(
    new ApiResponse(200, { order }, 'Order status updated successfully')
  );
});


// --- PDF INVOICE GENERATOR ---
export const downloadInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id);

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  // Security Check
  if (req.user.role === 'user' && order.user?.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('You are not authorized to access this invoice');
  }

  const doc = new PDFDocument({ margin: 50 });

  // Stream PDF directly to client response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);
  doc.pipe(res);

  // Cyberpunk Terminal Aesthetics: Dark/white high contrast, Acid Green borders
  // Background simulation
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#000000');

  // Header / Title Glow simulation
  doc.fillColor('#39ff14') // Acid Green
     .font('Courier-Bold')
     .fontSize(22)
     .text('PROJECT NEXUS // SECURE INVOICE UPLINK', 50, 50);

  doc.strokeColor('#39ff14')
     .lineWidth(2)
     .moveTo(50, 75)
     .lineTo(doc.page.width - 50, 75)
     .stroke();

  // Meta details
  doc.fillColor('#ffea00') // Hazard Yellow
     .font('Courier')
     .fontSize(10)
     .text(`ORDER REF:   ${order.orderNumber}`, 50, 95)
     .text(`STATUS:      ${order.payment.status.toUpperCase()} // ${order.fulfillmentStatus.toUpperCase()}`, 50, 110)
     .text(`TIMESTAMP:   ${order.createdAt.toISOString()}`, 50, 125);

  // Shipping details
  doc.fillColor('#ffffff')
     .font('Courier-Bold')
     .fontSize(12)
     .text('DESTINATION UPLINK ADDRESS:', 50, 160);

  const addr = order.shippingAddress;
  doc.font('Courier')
     .fontSize(10)
     .fillColor('#cccccc')
     .text(`${addr.street}`, 50, 175)
     .text(`${addr.city}, ${addr.state} ${addr.zip}`, 50, 187)
     .text(`${addr.country}`, 50, 199);

  // Items table header
  let y = 240;
  doc.strokeColor('#ff5500') // Blaze Orange
     .lineWidth(1)
     .moveTo(50, y)
     .lineTo(doc.page.width - 50, y)
     .stroke();

  doc.fillColor('#ff5500')
     .font('Courier-Bold')
     .fontSize(10)
     .text('SKU', 55, y + 5)
     .text('DESCRIPTION', 160, y + 5)
     .text('QTY', 370, y + 5)
     .text('UNIT PRICE', 420, y + 5)
     .text('TOTAL', 500, y + 5);

  doc.strokeColor('#ff5500')
     .moveTo(50, y + 20)
     .lineTo(doc.page.width - 50, y + 20)
     .stroke();

  y += 20;

  // Items rows
  doc.fillColor('#ffffff').font('Courier');
  for (const item of order.items) {
    y += 5;
    doc.text(`${item.sku}`, 55, y + 2)
       .text(`${item.name.substring(0, 26)}`, 160, y + 2)
       .text(`${item.qty}`, 370, y + 2)
       .text(`$${item.priceAtPurchase.toFixed(2)}`, 420, y + 2)
       .text(`$${(item.qty * item.priceAtPurchase).toFixed(2)}`, 500, y + 2);
    y += 18;
  }

  // Totals calculations box
  doc.strokeColor('#39ff14') // Acid Green border
     .lineWidth(1)
     .rect(340, y + 20, doc.page.width - 340 - 50, 110)
     .stroke();

  const financeY = y + 28;
  doc.fillColor('#ffffff')
     .text('SUBTOTAL:', 355, financeY)
     .text(`$${order.financials.subtotal.toFixed(2)}`, 490, financeY)
     
     .text('TAX (8%):', 355, financeY + 15)
     .text(`$${order.financials.tax.toFixed(2)}`, 490, financeY + 15)
     
     .text('SHIPPING:', 355, financeY + 30)
     .text(`$${order.financials.shippingCost.toFixed(2)}`, 490, financeY + 30)

     .fillColor('#ffea00') // Hazard Yellow for discounts
     .text('DISCOUNTS:', 355, financeY + 45)
     .text(`-$${order.financials.discountAmount.toFixed(2)}`, 490, financeY + 45)

     .fillColor('#39ff14') // Acid Green for final total
     .font('Courier-Bold')
     .fontSize(11)
     .text('GRAND TOTAL:', 355, financeY + 65)
     .text(`$${order.financials.total.toFixed(2)}`, 490, financeY + 65);

  // Footer message
  doc.fillColor('#ff5500')
     .font('Courier')
     .fontSize(8)
     .text('// END TRANSMISSION. TRANSACTION CONFIRMED ON SECURITY ENCLAVE //', 50, doc.page.height - 50, { align: 'center' });

  doc.end();
});

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const gmvData = await Order.aggregate([
    { $match: { 'payment.status': 'Completed' } },
    { $group: { _id: null, totalSales: { $sum: '$financials.total' } } }
  ]);
  const gmv = gmvData[0]?.totalSales || 0;

  const activeCarts = await Cart.countDocuments({
    items: { $exists: true, $not: { $size: 0 } }
  });

  const totalCarts = await Cart.countDocuments({});
  const totalOrders = await Order.countDocuments({ 'payment.status': 'Completed' });
  const conversionRate = totalCarts > 0 ? (totalOrders / totalCarts) * 100 : 0;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const salesHistory = await Order.aggregate([
    {
      $match: {
        'payment.status': 'Completed',
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        sales: { $sum: '$financials.total' },
        ordersCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      analytics: {
        gmv: Math.round(gmv * 100) / 100,
        activeCarts,
        totalOrders,
        conversionRate: Math.round(conversionRate * 100) / 100,
        salesHistory
      }
    }, 'Admin analytics fetched successfully')
  );
});
