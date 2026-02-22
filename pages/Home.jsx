import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Copy, HelpCircle, MessageSquareText } from 'lucide-react';
import { useAuth } from '../src/hooks/useAuth';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';
import { ContactSupportModal } from '../src/components/ContactSupportModal';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Chat state
  const [roomName, setRoomName] = useState('');
  const [username, setUsername] = useState(user?.username || '');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Contact modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Generate random room ID
  const generateRoomId = () => {
    const id = Math.floor(1000 + Math.random() * 9000);
    setRoomName(id.toString());
  };

  // Copy room ID to clipboard
  const copyRoomId = () => {
    if (!roomName) return;
    navigator.clipboard.writeText(roomName);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Join chat room
  const handleJoinRoom = (e) => {
    e.preventDefault();
    setError('');
    
    if (!roomName.trim()) {
      setError('Please enter or generate a Room ID');
      return;
    }
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    const trimmedRoom = roomName.trim();
    const trimmedUsername = username.trim();

    // Navigate to chat page with query params
    navigate(`/chat?room=${trimmedRoom}&username=${trimmedUsername}`);
  };

  // Main menu view
  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex justify-between items-center gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-1 truncate">
                <span className="bg-gradient-to-r from-gray-900 via-purple-800 to-black bg-clip-text text-transparent">
                  NextChat
                </span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">Welcome, {user?.username}</p>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              {/* Contact Support Button */}
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-green-600 hover:bg-green-50 transition-all group cursor-pointer"
                title="Contact Support"
              >
                <HelpCircle size={18} className="sm:w-5 sm:h-5 text-gray-600 group-hover:text-green-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-green-600 hidden sm:inline">
                  Help
                </span>
              </button>
              {/* User Icon Button */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 transition-all group cursor-pointer"
                title="My Profile"
              >
                <User size={18} className="sm:w-5 sm:h-5 text-gray-600 group-hover:text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-blue-600 hidden sm:inline">
                  Profile
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Menu View */}
        <div className="space-y-4">
          {/* Join Chat Room Card */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center mb-4">

              <MessageSquareText className="mr-2 sm:mr-2 text-blue-600" size={22} />
              {/* <MessageSquare className="mr-2 sm:mr-3 text-blue-600" size={20} /> */}
              <h2 className="text-xl sm:text-2xl font-bold">Join Chat Room</h2>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <Input
                label="Your Name"
                type="text"
                placeholder="Enter your name for chat"
                value={username}
                onChange={setUsername}
                disabled={true}
                required
              />

              <div>
                {/* Label + Generate Button */}
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Room ID
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRoomId}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Generate ID
                  </button>
                </div>

                {/* Input + Copy Icon */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter or Generate ID"
                    value={roomName}
                    onChange={(e) => {
                      setRoomName(e.target.value);
                      setError(''); // Clear error when user types
                    }}
                    className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 focus:border-black focus:ring-black focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-colors"
                  />

                  {/* Copy Button */}
                  {roomName && (
                    <button
                      type="button"
                      onClick={copyRoomId}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all cursor-pointer ${copied ? 'text-green-600' : 'text-gray-500 hover:text-blue-600'
                        }`}
                      title="Copy Room ID"
                    >
                      <Copy size={18} />
                    </button>
                  )}
                </div>

                {/* Copied Text */}
                {copied && (
                  <p className="text-xs text-green-600 mt-1">
                    ✔ Copied to clipboard!
                  </p>
                )}
                
                {/* Room Info Hint */}
                {!copied && (
                  <p className="text-xs text-gray-500 mt-1">
                    💡Share this Room ID with others to chat together
                  </p>
                )}
              </div>

              <Button type="submit" variant="primary" fullWidth>
                Join Room
              </Button>

              <p className="text-xs text-center text-gray-400 leading-relaxed">
                All messages are temporary and private to this room.
              </p>
            </form>
          </div>

          {/* Quick Profile Info Card */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <User className="mr-2 sm:mr-3 text-green-600" size={20} />
                <h2 className="text-xl sm:text-2xl font-bold">Quick Info</h2>
              </div>
            </div>
            <div className="space-y-2 text-sm sm:text-base text-gray-600">
              <p className="break-words"><span className="font-semibold">Username:</span> {user?.username}</p>
              <p className="break-words"><span className="font-semibold">Email:</span> {user?.email}</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm cursor-pointer"
            >
              View Full Profile →
            </button>
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            © {new Date().getFullYear()} NextChat. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Developed with ❤️ by <span className="font-semibold text-gray-800">ANKIT</span>
          </p>
        </div>
      </div>

      {/* Contact Support Modal */}
      <ContactSupportModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        user={user}
      />
    </div>
  );
}
