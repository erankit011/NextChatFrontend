import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ChatScreen from '../src/components/ChatScreen.jsx';

export function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [chatUser, setChatUser] = useState(null);

  useEffect(() => {
    const room = searchParams.get('room');
    const username = searchParams.get('username');
    
    if (room && username) {
      setChatUser({ username, room });
    } else {
      // If no params, redirect to home
      navigate('/home');
    }
  }, [searchParams, navigate]);

  const handleLeaveRoom = () => {
    navigate('/home');
  };

  if (!chatUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-100">
      <ChatScreen
        username={chatUser.username}
        room={chatUser.room}
        onLeave={handleLeaveRoom}
      />
    </div>
  );
}
