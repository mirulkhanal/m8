import { asyncHandler } from '../lib/errors/asyncHandler.js';
import prisma from '../lib/prisma.js';
import { AppError } from '../lib/errors/AppError.js';
import { io, listNamespace, userNamespace } from '../lib/socket.js'; // Update import

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
  const { listId, userId } = req.body; // userId is the ID of the user being invited
  const currentUserId = req.user.id; // ID of the user sending the invite (owner)

  // Verify list exists and current user is the owner
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) {
    throw new AppError('List not found', 404);
  }
  if (list.ownerId !== currentUserId) {
    throw new AppError('Only list owner can invite members', 403);
  }

  // Verify the user being invited exists
  const invitee = await prisma.user.findUnique({ where: { id: userId } });
  if (!invitee) {
    throw new AppError('User to invite not found', 404);
  }

  // Prevent inviting self or existing members
  if (userId === currentUserId) {
    throw new AppError('You cannot invite yourself to the list', 400);
  }
  if (list.members.includes(userId)) {
    throw new AppError('User is already a member of this list', 400);
  }

  // Check if invite already sent
  const existingInvite = await prisma.user.findFirst({
    where: {
      id: userId,
      groupInvites: { has: listId },
    },
  });
  if (existingInvite) {
    throw new AppError('Invitation already sent to this user for this list', 400);
  }

  // --- Removed friendship check ---

  // Update invitee's groupInvites array
  await prisma.user.update({
    where: { id: userId },
    data: {
      groupInvites: {
        push: listId,
      },
    },
  });

  // TODO: Consider emitting a socket event to the invited user if real-time invite notifications are desired

  // After successful invite logic
  
  // Emit socket event to notify the invitee
  userNamespace.to(`user:${userId}`).emit('listInviteReceived', {
    listId: list.id,
    listName: list.name,
    inviterId: currentUserId,
    inviterName: req.user.fullName,
    inviterAvatar: req.user.avatar
  });
  
  // Also notify all current list members about the new invitation
  listNamespace.to(`list:${listId}`).emit('memberInvited', {
    listId,
    inviteeId: userId,
    inviteeName: invitee.fullName
  });

  res.status(200).json({
    status: 'success',
    message: 'Invitation sent successfully',
  });
});

export const addItem = asyncHandler(async (req, res) => {
  // Accept content and optional metadata
  const { listId, content, metadata } = req.body;
  const userId = req.user.id; // Assuming you have user info from auth middleware

  if (!listId || !content) {
    throw new AppError('List ID and item content are required', 400);
  }

  // Verify user is a member of the list
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { members: true },
  });

  if (!list) {
    throw new AppError('List not found', 404);
  }

  if (!list.members.includes(userId)) {
    throw new AppError('Unauthorized to add items to this list', 403);
  }

  const newItem = await prisma.item.create({
    data: {
      content,
      listId,
      metadata: metadata || {}, // Store metadata, default to empty object if not provided
      completed: false, // Default completed status
    },
  });

  // Emit socket event to all clients in the list room with the full item data
  io.of('/list').to(listId).emit('itemAdded', { listId, item: newItem });

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
  const userId = req.user.id; // The user accepting the invite

  // Verify the invitation exists and get list owner ID
  const userPromise = prisma.user.findUnique({
    where: { id: userId },
    select: { groupInvites: true, friends: true }, // Select current friends
  });
  const listPromise = prisma.list.findUnique({
    where: { id: listId },
    select: { ownerId: true }, // Need the owner ID
  });

  const [user, list] = await Promise.all([userPromise, listPromise]);

  if (!list) {
    throw new AppError('List not found', 404); // List might have been deleted
  }
  if (!user || !user.groupInvites.includes(listId)) {
    throw new AppError('Invitation not found or expired', 404);
  }

  const ownerId = list.ownerId;

  // Add user to the list members and remove the invitation
  // Also, add owner and user to each other's friend lists if not already friends
  await prisma.$transaction([
    // 1. Add user to list members
    prisma.list.update({
      where: { id: listId },
      data: {
        members: { push: userId },
      },
    }),
    // 2. Remove invitation and add owner as friend (if not already)
    prisma.user.update({
      where: { id: userId },
      data: {
        groupInvites: {
          set: user.groupInvites.filter((id) => id !== listId),
        },
        // Add owner to friends list if not already present
        friends: user.friends.includes(ownerId) ? undefined : { push: ownerId },
      },
    }),
    // 3. Add accepting user to owner's friend list (if not already)
    prisma.user.update({
      where: { id: ownerId },
      // Fetch owner's friends first to check if the user is already a friend
      data: {
        friends: { push: userId }, // Simplification: Prisma handles duplicates gracefully in push for scalar lists
                                    // For production, you might fetch owner's friends first for absolute certainty
      },
    }),
  ]);

  // TODO: Emit socket events if needed (e.g., notify owner, update member lists)

  res.status(200).json({
    status: 'success',
    message: 'Invitation accepted successfully. You are now friends with the list owner.',
  });
});

// New function to toggle item completion status
export const toggleItemCompletion = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { list: { select: { members: true, id: true } } }, // Include list members and id
  });

  if (!item) {
    throw new AppError('Item not found', 404);
  }

  // Verify user is a member of the list associated with the item
  if (!item.list.members.includes(userId)) {
    throw new AppError('Unauthorized to modify this item', 403);
  }

  const updatedItem = await prisma.item.update({
    where: { id: itemId },
    data: {
      completed: !item.completed, // Toggle the completed status
    },
  });

  // Emit socket event to notify clients about the update
  io.of('/list')
    .to(item.list.id)
    .emit('itemUpdated', { listId: item.list.id, item: updatedItem });

  res.status(200).json({
    status: 'success',
    message: 'Item status updated',
    data: updatedItem,
  });
});

export const removeMemberFromList = asyncHandler(async (req, res) => {
  const { listId, memberId } = req.body;
  const currentUserId = req.user.id;

  // Verify list exists
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) {
    throw new AppError('List not found', 404);
  }

  // Verify current user is the owner
  if (list.ownerId !== currentUserId) {
    throw new AppError('Only the list owner can remove members', 403);
  }

  // Cannot remove the owner
  if (memberId === list.ownerId) {
    throw new AppError('Cannot remove the list owner', 400);
  }

  // Check if user is a member
  if (!list.members.includes(memberId)) {
    throw new AppError('User is not a member of this list', 404);
  }

  // Remove member from list
  const updatedList = await prisma.list.update({
    where: { id: listId },
    data: {
      members: {
        set: list.members.filter(id => id !== memberId)
      }
    }
  });

  // Notify all members about the removal via socket
  listNamespace.to(`list:${listId}`).emit('memberRemoved', {
    listId,
    memberId,
    removedBy: currentUserId
  });

  res.status(200).json({
    status: 'success',
    message: 'Member removed successfully',
    data: updatedList
  });
});
