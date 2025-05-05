import React, { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { getSessionById, getUserSessions } from '../services/sessionServices';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, socket, setActiveSessionId, setActivePartner } = useChat();
  const { logout } = useAuth();
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (!user) return;
    console.log("🧲 Sidebar içinde socket geldi:", socket.id);
    const fetchSessions = async () => {
      try {
        const data = await getUserSessions(user.id);
        setSessions(data);
      } catch (err) {
        console.error('Oturumlar alınamadı:', err);
      }
    };

    fetchSessions();

    socket.on('session_created', (newSession) => {
        if (newSession.participants?.some(p => String(p._id || p) === user.id)) {
            setSessions((prev) => [newSession, ...prev]);
        }
    });

    socket.on('session_updated', (updated) => {
        console.log('[socket] session_updated geldi:', updated);
      
        setSessions((prev) => {
          const exists = prev.find((s) => s._id === updated.sessionId);
          if (exists) {
            // Güncelle varsa güncelle
            const updatedSession = {
              ...exists,
              lastMessage: updated.lastMessage,
              updatedAt: updated.updatedAt,
            };
            const filtered = prev.filter((s) => s._id !== updated.sessionId);
            return [updatedSession, ...filtered];
          } else {
            // Yeni session fetch edilecek ama tekrar eklenmeden önce kontrol edilmeli
            getSessionById(updated.sessionId)
              .then((fetched) => {
                setSessions((curr) => {
                  const alreadyExists = curr.find((s) => s._id === fetched._id);
                  if (alreadyExists) return curr; // zaten varsa ekleme
                  return [fetched, ...curr];
                });
              })
              .catch((err) => {
                console.error('[HATA] Yeni session alınamadı:', err);
              });
      
            return prev;
          }
        });
      });

    return () => {
      socket.off('session_created');
      socket.off('session_updated');
    };
  }, [socket, user]);

  const handleSelectSession = (session) => {
    const partner = session.participants.find((p) => p._id !== user.id);
    setActiveSessionId(session._id);
    setActivePartner({ id: partner._id, username: partner.username });
    socket?.emit('join_session', session._id);
  };

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">Sohbetler</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sessions
          .filter((s) => Array.isArray(s.participants) && s.participants.some(p => p._id === user.id))
          .map((s) => (
            <div
              key={s._id}
              onClick={() => handleSelectSession(s)}
              className="p-3 border rounded hover:bg-gray-100 cursor-pointer"
            >
              <p className="font-semibold text-sm">
                {s.participants
                  .filter((p) => p._id !== user.id)
                  .map((p) => p.username)
                  .join(', ')}
              </p>
              <p className="text-xs text-gray-500 truncate">{s.lastMessage}</p>
            </div>
          ))}
      </div>

      <div className="p-4 border-t">
        <button
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}