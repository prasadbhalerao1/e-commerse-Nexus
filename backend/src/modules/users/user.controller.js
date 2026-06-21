import User from './User.model.js';
import { NotFoundError, BadRequestError } from '../../core/errors.js';
import asyncHandler from '../../common/utils/asyncHandler.js';
import ApiResponse from '../../core/responses/ApiResponse.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, email } = req.body;
  
  if (email && email !== req.user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new BadRequestError('Email address is already in use');
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { firstName, lastName, email } },
    { new: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, { user: updatedUser }, 'Profile updated successfully')
  );
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const newAddress = req.body;

  if (newAddress.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  } else if (user.addresses.length === 0) {
    newAddress.isDefault = true;
  }

  user.addresses.push(newAddress);
  await user.save();

  return res.status(201).json(
    new ApiResponse(201, { addresses: user.addresses }, 'Address added successfully')
  );
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);

  const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId);
  if (addressIndex === -1) {
    throw new NotFoundError('Address not found');
  }

  const removedDefault = user.addresses[addressIndex].isDefault;
  user.addresses.splice(addressIndex, 1);

  if (removedDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, { addresses: user.addresses }, 'Address removed successfully')
  );
});

export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  return res.status(200).json(
    new ApiResponse(200, { addresses: user.addresses }, 'Addresses fetched successfully')
  );
});

// Admin endpoints
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  return res.status(200).json(
    new ApiResponse(200, { users }, 'All users fetched successfully')
  );
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return res.status(200).json(
    new ApiResponse(200, null, 'User deleted successfully')
  );
});
