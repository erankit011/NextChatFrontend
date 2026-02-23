import { useEffect, useRef, useState, useCallback } from "react";
import { LogOut, Smile, SendHorizonal, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmojiPicker from 'emoji-picker-react';
import { io } from "socket.io-client";

// Get Socket URL from environment variable
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8085";

const ChatScreen = ({ username, room, onLeave }) => {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState(() => {
        // Load messages from localStorage for this room
        const savedData = localStorage.getItem(`chat_messages_${room}`);
        if (savedData) {
            try {
                const { messages: savedMessages, timestamp } = JSON.parse(savedData);
                const now = Date.now();
                const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

                // Check if messages are older than 30 minutes
                if (now - timestamp < thirtyMinutes) {
                    return savedMessages;
                } else {
                    // Clear old messages
                    localStorage.removeItem(`chat_messages_${room}`);
                }
            } catch (error) {
                console.warn('Error loading messages:', error);
            }
        }
        return [];
    });
    const [typingUsers, setTypingUsers] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const socketRef = useRef(null);
    const typingTimeout = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ["websocket"] });
        socketRef.current = socket;

        socket.emit("join_room", { room, username });

        socket.on("receive_message", (data) => {
            setMessages((prev) => [...prev, data]);
        });

        socket.on("system_message", (data) => {
            setMessages((prev) => [
                ...prev,
                {
                    ...data,
                    type: "system",
                },
            ]);
        });

        socket.on("user_typing", ({ username: typingName, isTyping }) => {
            setTypingUsers((prev) => {
                if (typingName === username) return prev;
                if (isTyping) {
                    if (!prev.includes(typingName)) {
                        return [...prev, typingName];
                    }
                } else {
                    return prev.filter((name) => name !== typingName);
                }
                return prev;
            });
        });

        return () => socket.disconnect();
    }, [room, username]);

    // Save messages to localStorage with timestamp (auto-delete after 30 minutes)
    useEffect(() => {
        try {
            // Keep only last 100 messages to prevent localStorage overflow
            const messagesToSave = messages.slice(-100);
            const dataToSave = {
                messages: messagesToSave,
                timestamp: Date.now() // Current timestamp
            };
            localStorage.setItem(`chat_messages_${room}`, JSON.stringify(dataToSave));
        } catch (error) {
            // If localStorage is full, clear old messages
            console.warn('localStorage full, clearing old messages');
            localStorage.removeItem(`chat_messages_${room}`);
        }
    }, [messages, room]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typingUsers]);

    const sendMessage = useCallback(() => {
        if (!message.trim()) return;

        const data = {
            id: Date.now(),
            room,
            author: username,
            message,
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        socketRef.current.emit("send_message", data);
        setMessages((prev) => [...prev, data]);
        setMessage("");

        socketRef.current.emit("stop_typing", { room, username });
    }, [message, room, username]);

    const handleTyping = (e) => {
        setMessage(e.target.value);
        socketRef.current.emit("typing", { room, username });

        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socketRef.current.emit("stop_typing", { room, username });
        }, 1200);
    };

    const handleLeave = () => {
        setShowLeaveModal(true);
    };

    const confirmLeave = () => {
        socketRef.current?.disconnect();
        setShowLeaveModal(false);
        onLeave();
    };

    const handleSend = (e) => {
        e.preventDefault();
        sendMessage();
    };

    const onEmojiClick = (emojiObject) => {
        setMessage((prev) => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className="h-screen w-full bg-gray-50 flex flex-col overflow-hidden">
            <div className="flex flex-col w-full h-full bg-white shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
                    {/* BACK BUTTON */}
                    <button
                        onClick={() => navigate('/home')}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
                        title="Back to Home"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>

                    {/* CENTER - USER INFO */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-center">
                        <button
                            onClick={() => {
                                const currentChatUrl = `/chat?room=${room}&username=${username}`;
                                navigate(`/profile?returnUrl=${encodeURIComponent(currentChatUrl)}`);
                            }}
                            className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full text-black-600 flex-shrink-0 border-2 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                            title="View Profile"
                        >
                            <User size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                        </button>

                        <div className="flex-1 min-w-0">
                            <h2 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                                {username}
                            </h2>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <p className="text-xs text-gray-500 truncate">Room: {room}</p>

                                {/* COPY ICON */}
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(room);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 1500);
                                    }}
                                    className={`p-0.5 rounded transition-all cursor-pointer flex-shrink-0 ${
                                        copied ? 'text-green-600' : 'text-gray-400 hover:text-black'
                                    }`}
                                    title="Copy Room ID"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <rect x="9" y="9" width="13" height="13" rx="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                </button>

                                {copied ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-green-600 flex-shrink-0">
                                        ✔ Copied!
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs text-green-600 flex-shrink-0">
                                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                                        <span>Active</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE - LEAVE BUTTON */}
                    <button
                        onClick={handleLeave}
                        className="p-2 sm:p-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer flex-shrink-0"
                        title="Leave Room"
                    >
                        <LogOut size={20} className="sm:w-5 sm:h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div
                    className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 py-3 sm:py-4 space-y-2 sm:space-y-3"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundColor: '#ffffffff',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {messages.map((msg) => {
                        return msg.type === "system" ? (
                            <div key={msg.id} className="flex justify-center my-2 sm:my-3">
                                <div className="text-gray-700 text-xs sm:text-sm px-3 py-1.5">
                                    {msg.message}
                                    <span className="ml-2 text-[10px] text-gray-400">{msg.time}</span>
                                </div>
                            </div>
                        ) : (
                            <div
                                key={msg.id}
                                className={`flex ${msg.author === username
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[85%] sm:max-w-[70%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-base break-words transition-all ${msg.author === username
                                        ? "bg-black text-white border border-black-200 hover:border-black-100 rounded-br-md"
                                        : "bg-white text-gray-800 border border-gray-200 hover:border-gray-100 rounded-bl-md"
                                        }`}
                                >
                                    {msg.author !== username && (
                                        <p className="text-xs font-semi text-gray-900 mb-1.5">
                                            {msg.author}
                                        </p>
                                    )}
                                    <p className="leading-relaxed text-[18px] sm:text-[20px]">{msg.message}</p>
                                    <span className={`block text-[9px] sm:text-[10px] text-right ${msg.author === username ? "text-gray-300" : "text-gray-400"
                                        }`}>
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        )
                    })}

                    {typingUsers.length > 0 && (
                        <div className="flex justify-start">
                            <div>
                                <p className="text-xs text-gray-600">
                                    {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing
                                    <span className="inline-flex gap-0.5 ml-1">
                                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Footer Input Area */}
                <footer className="bg-white border-t border-gray-200 p-2 sm:p-3 flex justify-center items-center relative flex-shrink-0">
                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <>
                            {/* Backdrop to close picker */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowEmojiPicker(false)}
                            ></div>
                            <div className="absolute bottom-16 sm:bottom-20 left-2 sm:left-4 z-50 shadow-2xl rounded-lg overflow-hidden">
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    width={280}
                                    height={350}
                                />
                            </div>
                        </>
                    )}

                    <form
                        onSubmit={handleSend}
                        className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 w-full max-w-md border border-gray-200"
                    >
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 transition shrink-0 cursor-pointer"
                            tabIndex={-1}
                            aria-label="Insert emoji"
                        >
                            <Smile className="text-gray-500" size={20} />
                        </button>
                        {/* <button
                            type="button"
                            className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 transition shrink-0 cursor-pointer hidden sm:block"
                            tabIndex={-1}
                            aria-label="Attach file"
                        >
                            <Paperclip className="text-gray-500" size={20} />
                        </button> */}

                        <input
                            value={message}
                            onChange={handleTyping}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent py-1.5 px-1 sm:px-2 outline-none text-base text-gray-900 placeholder-gray-500 min-w-0"
                            autoComplete="off"
                            style={{ fontSize: '16px' }}
                        />

                        <button
                            type="submit"
                            disabled={message.trim() === ""}
                            className={`px-4 sm:px-8 py-2 sm:py-2.5 bg-black text-white rounded-full flex items-center justify-center transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 active:scale-95 shrink-0 ${message.trim() === ""
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-gray-800 cursor-pointer shadow-md"
                                }`}
                        >
                            <SendHorizonal size={20} />
                        </button>
                    </form>
                </footer>

                {/* Leave Confirmation Modal */}
                {showLeaveModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 sm:p-6 animate-fadeIn">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Leave Room?</h2>
                            <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6">
                                Are you sure you want to leave this chat room?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={confirmLeave}
                                    className="flex-1 px-4 py-2.5 sm:py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all cursor-pointer text-sm sm:text-base"
                                >
                                    Yes, Leave
                                </button>
                                <button
                                    onClick={() => setShowLeaveModal(false)}
                                    className="flex-1 px-4 py-2.5 sm:py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all cursor-pointer text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatScreen;
