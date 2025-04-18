import { asyncHandler } from '../lib/errors/asyncHandler.js';
import prisma from '../lib/prisma.js';
import { AppError } from '../lib/errors/AppError.js';

export const createList = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const ownerId = req.user.id;

  if (!name) {
    throw new AppError('List name is required', 400);
  }

  const newList = await prisma.list.create({
    data: {
      name,
      ownerId,
      members: [ownerId],
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'List created successfully',
    data: newList,
  });
});

export const inviteToList = asyncHandler(async (req, res) => {
  const { listId, userId } = req.body;
  const currentUserId = req.user.id;

  // Verify list exists and current user is the owner
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) {
    throw new AppError('List not found', 404);
  }
  if (list.ownerId !== currentUserId) {
    throw new AppError('Only list owner can invite members', 403);
  }

  // Verify friendship exists between inviter and invitee
  const inviter = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { friends: true },
  });
  if (!inviter.friends.includes(userId)) {
    throw new AppError('You can only invite friends to your list', 403);
  }

  // Update invitee's groupInvites array
  await prisma.user.update({
    where: { id: userId },
    data: {
      groupInvites: {
        push: listId,
      },
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Invitation sent successfully',
  });
});

export const addItem = asyncHandler(async (req, res) => {
  const { listId, content } = req.body;

  const newItem = await prisma.item.create({
    data: {
      content,
      listId,
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Item added successfully',
    data: newItem,
  });
});

export const fetchListForAuthUser = asyncHandler(async (req, res) => {
  const { user } = req;

  const authUserMemberedLists = await prisma.list.findMany({
    where: {
      members: {
        has: user.id,
      },
    },
    include: {
      items: true,
    },
  });

  console.log('Auth User Membered List: ', authUserMemberedLists);

  if (!authUserMemberedLists.length > 0) {
    throw new AppError("User hasn't joined a List ", 404);
  }

  res.status(200).send(authUserMemberedLists);
});

export const getListMembers = asyncHandler(async (req, res) => {
  const { listId } = req.params;

  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: {
      members: true,
    },
  });

  if (!list) {
    throw new AppError('List not found', 404);
  }

  const members = await prisma.user.findMany({
    where: { id: { in: list.members } },
    select: {
      id: true,
      fullName: true,
      avatar: true,
    },
  });

  res.status(200).json(members);
});

export const getListItems = asyncHandler(async (req, res) => {
  const { listId } = req.params;

  // Check if list exists and user is a member
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { members: true },
  });

  if (!list) {
    throw new AppError('List not found', 404);
  }

  if (!list.members.includes(req.user.id)) {
    throw new AppError('Unauthorized access to list items', 403);
  }

  // Fetch items for the list
  const items = await prisma.item.findMany({
    where: { listId },
    orderBy: { createdAt: 'asc' },
  });

  res.status(200).json({
    status: 'success',
    data: items,
  });
});

export const getGroupInvites = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user's group invites
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      groupInvites: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get detailed information about each invited list
  const invites = await prisma.list.findMany({
    where: { id: { in: user.groupInvites } },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          avatar: true
        }
      }
    }
  });

  res.status(200).json({
    status: 'success',
    data: invites
  });
});

export const acceptInvite = asyncHandler(async (req, res) => {
  const { listId } = req.body;
  const userId = req.user.id;

  // Verify the invitation exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { groupInvites: true },
  });

  if (!user || !user.groupInvites.includes(listId)) {
    throw new AppError('Invitation not found', 404);
  }

  // Add user to the list members and remove the invitation
  await prisma.$transaction([
    prisma.list.update({
      where: { id: listId },
      data: {
        members: { push: userId },
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        groupInvites: {
          set: user.groupInvites.filter((id) => id !== listId),
        },
      },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Invitation accepted successfully',
  });
});
