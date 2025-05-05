import React, { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { createOrGetSession } from '../services/sessionServices';
import { getUserById } from '../services/userServices';

export default function ActiveUsers() {
  const { user, socket, setActiveSessionId, setActivePartner } = useChat();
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('user_connected', user.id);

    socket.on('update_online_users', (users) => {
      if (Array.isArray(users)) {
        setOnlineUsers(users.filter((u) => u._id !== user.id));
      } else {
        console.warn('Beklenmeyen online users formatı:', users);
        setOnlineUsers([]);
      }
    });

    return () => {
      socket.off('update_online_users');
    };
  }, [socket, user]);

  const handleUserClick = async (otherUserId) => {
    try {
      const session = await createOrGetSession(user.id, otherUserId);
      socket?.emit('join_session', session._id);
      setActiveSessionId(session._id);

      const partnerData = await getUserById(otherUserId);
      setActivePartner({ id: otherUserId, username: partnerData.username });
    } catch (err) {
      console.error('Session alınamadı:', err);
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">Aktif Kullanıcılar</h2>

      <div className="flex-1 overflow-y-auto space-y-2">
        {onlineUsers.length === 0 ? (
          <p className="text-sm text-gray-500">Şu anda aktif başka kullanıcı yok.</p>
        ) : (
          onlineUsers.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserClick(user._id)}
              className="p-3 rounded-md bg-white shadow-sm border hover:bg-green-50 hover:shadow transition cursor-pointer"
            >
              <p className="text-sm font-medium text-gray-800">{user.username}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}