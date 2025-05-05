import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user: authUser } = useAuth(); // AuthContext'ten kullanıcı
  const [socket, setSocket] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activePartner, setActivePartner] = useState(null);

  useEffect(() => {
    if (!authUser) return;
  
    const newSocket = io('http://localhost:3001');
  
    newSocket.on('connect', () => {
      console.log('🧠 Socket bağlandı:', newSocket.id);
      newSocket.emit('user_connected', authUser.id);
    });
  
    setSocket(newSocket);
  
    return () => {
      newSocket.disconnect();
    };
  }, [authUser]);

  return (
    <ChatContext.Provider
      value={{
        socket,
        user: authUser, // user artık authUser'dan geliyor
        activeSessionId,
        setActiveSessionId,
        activePartner,
        setActivePartner,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};