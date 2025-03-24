import { asyncHandler } from '../lib/errors/asyncHandler.js';
import prisma from '../lib/prisma.js';
import { AppError } from '../lib/errors/AppError.js';

export const sendFriendRequest = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.user.id;

  if (userId === currentUserId) {
    throw new AppError('You cannot send a friend request to yourself', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      friendRequests: { push: currentUserId },
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Friend request sent successfully',
  });
});

export const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.user.id;

  const user = await prisma.user.findUnique({ where: { id: currentUserId } });
  if (!user || !user.friendRequests.includes(userId)) {
    throw new AppError('Friend request not found', 404);
  }

  // Update both users' friends lists
  await prisma.$transaction([
    prisma.user.update({
      where: { id: currentUserId },
      data: {
        friendRequests: {
          set: user.friendRequests.filter((id) => id !== userId),
        },
        friends: { push: userId },
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        friends: { push: currentUserId },
      },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Friend request accepted successfully',
  });
});

export const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.user.id;

  if (userId === currentUserId) {
    throw new AppError('You cannot block yourself', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  await prisma.$transaction([
    // Remove from friends list if they are friends
    prisma.user.update({
      where: { id: currentUserId },
      data: {
        friends: {
          set: (await prisma.user.findUnique({ where: { id: currentUserId } })).friends.filter(
            (id) => id !== userId
          ),
        },
        blockedUsers: { push: userId },
      },
    }),
    // Remove from the other user's friends list
    prisma.user.update({
      where: { id: userId },
      data: {
        friends: {
          set: (await prisma.user.findUnique({ where: { id: userId } })).friends.filter(
            (id) => id !== currentUserId
          ),
        },
      },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    message: 'User blocked successfully',
  });
});

export const removeFriend = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.user.id;

  const user = await prisma.user.findUnique({ where: { id: currentUserId } });
  if (!user || !user.friends.includes(userId)) {
    throw new AppError('Friend not found', 404);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: currentUserId },
      data: {
        friends: {
          set: user.friends.filter((id) => id !== userId),
        },
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        friends: {
          set: (await prisma.user.findUnique({ where: { id: userId } })).friends.filter(
            (id) => id !== currentUserId
          ),
        },
      },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Friend removed successfully',
  });
});

export const getFriendRequests = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: {
      friendRequests: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get detailed information about users who sent friend requests
  const requesters = await prisma.user.findMany({
    where: { id: { in: user.friendRequests } },
    select: {
      id: true,
      fullName: true,
      avatar: true,
      email: true,
    },
  });

  res.status(200).json(requesters);
});

export const getFriends = asyncHandler(async (req, res) => {
  const currentUserId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: {
      friends: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get detailed information about friends
  const friends = await prisma.user.findMany({
    where: { id: { in: user.friends } },
    select: {
      id: true,
      fullName: true,
      avatar: true,
      email: true,
    },
  });

  res.status(200).json(friends);
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { email } = req.query;
  const currentUserId = req.user.id;

  if (!email) {
    throw new AppError('Email is required for search', 400);
  }

  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: email,
        mode: 'insensitive',
      },
      id: {
        not: currentUserId,
      },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      avatar: true,
    },
  });

  res.status(200).json(users);
});
