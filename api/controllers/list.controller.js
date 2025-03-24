import { asyncHandler } from '../lib/errors/asyncHandler.js';
import prisma from '../lib/prisma.js';
import { AppError } from '../lib/errors/AppError.js';
import { io } from '../lib/socket.js';

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

  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) {
    throw new AppError('List not found', 404);
  }

  // Add user to list members
  await prisma.list.update({
    where: { id: listId },
    data: {
      members: {
        push: userId,
      },
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'User invited successfully',
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

  //FIXME: Emit real-time update to all list members
  io.to(listId).emit('itemAdded', newItem);

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
