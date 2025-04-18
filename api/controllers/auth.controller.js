import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/util.js';
import { asyncHandler } from '../lib/errors/asyncHandler.js';
import { AppError } from '../lib/errors/AppError.js';
import cloudinary from '../lib/cloudinary.js';
import prisma from '../lib/prisma.js';

export const signup = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    throw new AppError('Please provide all required fields', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
    },
  });

  console.log('Success creating user: ', newUser);
  generateToken(newUser.id, res);

  return res.status(201).json({
    status: 'success',
    message: 'User successfully created',
    userID: newUser.id,
  });
});

// This function is missing in your controller but is referenced in routes
export const checkAuth = asyncHandler(async (req, res) => {
  // req.user is already set by verifyAuth middleware
  return res.status(200).json({
    status: 'success',
    user: req.user,
  });
});

// Fix the login response to include user data
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (!existingUser) {
    throw new AppError('User does not exist', 404);
  }

  const verifiedPassword = await bcrypt.compare(
    password,
    existingUser.password
  );
  if (!verifiedPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken(existingUser.id, res);

  // Return user data along with token
  return res.status(200).json({
    status: 'success',
    message: 'Successfully logged in',
    token,
    user: {
      id: existingUser.id,
      email: existingUser.email,
      fullName: existingUser.fullName,
      avatar: existingUser.avatar,
      createdAt: existingUser.createdAt,
      updatedAt: existingUser.updatedAt,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({
    status: 'success',
    message: 'Successfully logged out',
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName } = req.body;
  const avatarFile = req.files?.avatar;

  if (!fullName && !avatarFile) {
    throw new AppError(
      'Please provide at least one field to update (fullName or avatar)',
      400
    );
  }

  let avatarUrl;
  if (avatarFile) {
    const uploaderRes = await cloudinary.uploader.upload(
      avatarFile.tempFilePath
    );
    avatarUrl = uploaderRes.secure_url;
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(fullName && { fullName }),
      ...(avatarUrl && { avatar: avatarUrl }),
    },
    select: {
      email: true,
      fullName: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user: updatedUser,
    },
  });
});
