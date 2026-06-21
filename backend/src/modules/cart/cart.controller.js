import Cart from './Cart.model.js';
import Product from '../products/Product.model.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../core/responses/ApiResponse.js';

export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price slug images inventory');
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  return res.status(200).json(
    new ApiResponse(200, { cart }, 'Cart retrieved successfully')
  );
});

export const syncCart = asyncHandler(async (req, res) => {
  const { items } = req.body;
  
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const mergedItems = [];

  for (const localItem of items) {
    const product = await Product.findById(localItem.product);
    if (!product || !product.isActive) continue;

    const existingIndex = cart.items.findIndex(
      (dbItem) => dbItem.product.toString() === localItem.product
    );

    if (existingIndex > -1) {
      const quantity = Math.max(cart.items[existingIndex].quantity, localItem.quantity);
      mergedItems.push({
        product: product._id,
        quantity,
        priceAtAdded: product.price
      });
    } else {
      mergedItems.push({
        product: product._id,
        quantity: localItem.quantity,
        priceAtAdded: product.price
      });
    }
  }

  for (const dbItem of cart.items) {
    const inMerged = mergedItems.find(
      (mItem) => mItem.product.toString() === dbItem.product.toString()
    );
    if (!inMerged) {
      const product = await Product.findById(dbItem.product);
      if (product && product.isActive) {
        mergedItems.push({
          product: dbItem.product,
          quantity: dbItem.quantity,
          priceAtAdded: dbItem.priceAtAdded
        });
      }
    }
  }

  cart.items = mergedItems;
  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price slug images inventory');

  return res.status(200).json(
    new ApiResponse(200, { cart: populatedCart }, 'Cart synchronized successfully')
  );
});
