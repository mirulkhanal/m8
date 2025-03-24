import jwt from 'jsonwebtoken';
import { AppError } from '../lib/errors/AppError.js';
import { asyncHandler } from '../lib/errors/asyncHandler.js';
import prisma from '../lib/prisma.js';

export const verifyAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    throw new AppError('Please login to access this resource', 401);
  }

  console.log(token);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure that the decoded token contains the correct userId field
    const userId = decoded.userId;

    console.log(userId, 'Decoded UID');
    if (!userId) {
      throw new AppError('Invalid token. Please login again', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token. Please login again', 401);
    }
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Your token has expired. Please login again', 401);
    }
    throw error;
  }
});
