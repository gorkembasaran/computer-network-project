import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { getMessagesBySession } from '../services/messageServices';

export default function ChatWindow() {
  const { user, socket, activeSessionId, activePartner } = useChat();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!activeSessionId || !user) return;

    socket.emit('join_session', activeSessionId);

    getMessagesBySession(activeSessionId)
      .then(setMessages)
      .catch((err) => console.error('Mesajlar alınamadı:', err));

    socket.on('receive_message', (msg) => {
      if (msg.sessionId === activeSessionId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off('receive_message');
    };
  }, [activeSessionId, socket, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !activeSessionId) return;

    socket.emit('send_message', {
      sessionId: activeSessionId,
      senderId: user.id,
      content: newMessage,
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b bg-white shadow-sm text-center font-semibold text-lg">
        {activePartner ? `Sohbet: ${activePartner.username}` : 'Sohbet seçin'}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-gray-50">
        {messages.map((msg, idx) => {
          const isOwn = String(msg.sender?._id || msg.senderId) === user.id;
          return (
            <div
              key={idx}
              className={`max-w-[70%] px-4 py-2 rounded-lg text-sm shadow ${
                isOwn
                  ? 'ml-auto bg-blue-500 text-white rounded-br-none'
                  : 'mr-auto bg-white text-gray-800 rounded-bl-none border'
              }`}
            >
              {msg.content}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-white flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Mesaj yaz..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium"
          onClick={handleSend}
        >
          Gönder
        </button>
      </div>
    </div>
  );
}