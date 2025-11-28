import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { messagesServices } from "../../services";

const socket = io(import.meta.env.VITE_API_URL);

export default function Messages() {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const admin = JSON.parse(localStorage.getItem("user"));
  const adminId = admin?.id;

  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.emit("admin_join");

    socket.on("user_list", (list) => setUsers(list));

    socket.on("new_message", (msg) => {
      if (
        msg.senderId === activeUser?.userid ||
        msg.receiverId === activeUser?.userid
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    loadChatUsers();
  }, [activeUser]);

  const loadChatUsers = async () => {
    try {
      const res = await messagesServices.getChatUsers();
      setUsers(res.data.data || []);
    } catch (err) {
      console.log("❌ Load users failed:", err);
    }
  };

  const selectUser = async (user) => {
    setActiveUser(user);
    socket.emit("admin_open_chat", user.userid);

    try {
      const res = await messagesServices.getMessages(user.userid);
      setMessages(res.data.data || []);
    } catch (err) {
      console.log("❌ Load messages error:", err);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !activeUser) return;

    const payload = {
      receiverId: activeUser.userid,
      content: text,
    };

    try {
      const res = await messagesServices.sendMessage(payload);
      const savedMessage = res.data.data;

      socket.emit("admin_message", savedMessage);
      setMessages((prev) => [...prev, savedMessage]);
      setText("");
    } catch (err) {
      console.log("❌ Send message failed:", err);
    }
  };
  return (
    <div className="w-full h-screen grid grid-cols-[300px_1fr] bg-gray-100">

      {/* LEFT (scroll riêng) */}
      <div className="bg-white border-r shadow-md p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Users</h2>

        {users.map((u) => (
          <div
            key={u.userid}
            onClick={() => selectUser(u)}
            className={`p-3 rounded-xl cursor-pointer mb-2 transition-all ${
              activeUser?.userid === u.userid
                ? "bg-teal-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <p className="font-semibold">{u.name || "User " + u.userid}</p>
            <p className="text-sm opacity-70">ID: {u.userid}</p>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL (phải có min-h-0 mới scroll đúng) */}
      <div className="flex flex-col h-full min-h-0">

        {/* HEADER */}
        <div className="bg-white p-4 shadow-md border-b">
          <h2 className="text-xl font-semibold">
            {activeUser
              ? `Chat with: ${activeUser.name || activeUser.userid}`
              : "Select a user"}
          </h2>
        </div>

        {/* MESSAGE LIST (scroll đúng) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {!activeUser && (
            <p className="text-gray-500 text-center mt-20">
              Choose a user to start chatting.
            </p>
          )}

          {activeUser &&
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.senderid === adminId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-xl max-w-[70%] shadow ${
                    m.senderid === adminId
                      ? "bg-teal-600 text-white"
                      : "bg-white"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

          <div ref={messageEndRef} />
        </div>

        {/* INPUT */}
        {activeUser && (
          <div className="p-4 bg-white border-t flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded-xl px-3 py-2"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              onClick={sendMessage}
              className="bg-teal-600 text-white px-5 py-2 rounded-xl"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
