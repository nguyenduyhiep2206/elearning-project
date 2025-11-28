const messageService = require("../services/message.service");

let onlineUsers = new Map();

function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("register", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log("Registered:", userId, socket.id);
    });

    socket.on("send_message", async (data) => {
      const { senderId, receiverId, content } = data;

      const msg = await messageService.createMessage(senderId, receiverId, content);

      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit("new_message", msg);
      }

      const senderSocket = onlineUsers.get(senderId);
      if (senderSocket) {
        io.to(senderSocket).emit("message_sent", msg);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);

      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
    });
  });
}

module.exports = socketHandler;
