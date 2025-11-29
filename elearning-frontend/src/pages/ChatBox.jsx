import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { messagesServices } from "../services";

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL, { transports: ["websocket"] });

const UserChatModal = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const loadMessages = async () => {
    if (!user?.id) return;
    try {
      const res = await messagesServices.getMessages(user.id);
      setMessages(res.data.data || []);
    } catch (err) {
      console.log("Load messages error:", err);
    }
  };

  useEffect(() => {
    if (open) loadMessages();
  }, [open, user]);

  useEffect(() => {
    socket.on("admin_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("admin_message");
    };
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const bottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 10;
    setIsAtBottom(bottom);
  };

  const sendMessage = async () => {
    if (!text.trim() || !user?.id) return;
    const payload = {
      receiverId: user.id,
      content: text,
    };

    try {
      const res = await messagesServices.sendMessage(payload);
      const savedMessage = res.data.data;

      socket.emit("user_message", payload);

      setMessages((prev) => [...prev, savedMessage]);
      setText("");
    } catch (err) {
      console.log("❌ Send message failed:", err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end max-w-full">
      <button
        onClick={() => setOpen(!open)}
        className="bg-teal-600 w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:bg-teal-700 transition-all duration-300"
      >
        <i className="fas fa-comments text-white text-xl"></i>
      </button>

      {open && (
        <div className="mt-2 w-80 max-w-full bg-white rounded-2xl shadow-xl flex flex-col max-h-[80vh]">
          <div className="p-3 bg-teal-600 text-white rounded-t-2xl flex justify-between items-center">
            <h3 className="font-semibold text-lg">Support Chat</h3>
            <button onClick={() => setOpen(false)}>
              <i className="fas fa-times text-white" />
            </button>
          </div>

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50"
            style={{ minHeight: "200px" }}
          >
            {messages.length === 0 && (
              <p className="text-gray-500 text-center mt-10">
                Start chatting with support
              </p>
            )}

            {messages.map((m, index) => (
              <div
                key={index}
                className={m.senderid === user.id ? "text-right" : "text-left"}
              >
                <span
                  className={`inline-block p-2 rounded-xl max-w-[70%] break-words ${
                    m.senderid === user.id
                      ? "bg-teal-500 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {m.content}
                </span>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded-xl outline-none"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-teal-600 text-white px-4 py-2 rounded-xl"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserChatModal;
