import User from '../models/User.js';

const onlineUsers = new Map(); // userId -> socketId


export const getOnlineUsers = async () => {
  const userIds = Array.from(onlineUsers.keys());
  const users = await User.find({ _id: { $in: userIds } }, 'username'); // sadece username al
  return users;
};

export const addOnlineUser = (userId, socketId) => {
    onlineUsers.set(String(userId), socketId);
  };
  
  export const getSocketId = (userId) => {
    return onlineUsers.get(String(userId));
  };
  
  export const removeOnlineUser = (socketId) => {
    for (const [userId, id] of onlineUsers.entries()) {
      if (id === socketId) {
        onlineUsers.delete(userId);
        break;
      }
    }
  };