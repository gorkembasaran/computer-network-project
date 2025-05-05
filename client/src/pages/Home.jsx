import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ActiveUsers from '../components/ActiveUsers';

export default function Home() {
  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="w-1/4 border-r">
        <Sidebar />
      </div>

      <div className="w-2/4">
        <ChatWindow />
      </div>

      <div className="w-1/4 border-l">
        <ActiveUsers />
      </div>
    </div>
  );
}