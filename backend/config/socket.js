let io;

const initSocket = (server) => {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: { origin: "*" }
  });

  const leaveVideoRoom = (socket) => {
    const roomId = socket.data.videoRoomId;

    if (!roomId) return;

    socket.leave(roomId);
    socket.to(roomId).emit("videoUserLeft", { socketId: socket.id });
    socket.data.videoRoomId = null;
  };

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("sendMessage", (msg) => {
      io.emit("receiveMessage", msg);
    });

    socket.on("joinVideoRoom", ({ roomId, user } = {}) => {
      if (!roomId) return;

      leaveVideoRoom(socket);

      socket.join(roomId);
      socket.data.videoRoomId = roomId;
      socket.data.videoUser = user || {};

      const peers = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        .filter((id) => id !== socket.id);

      socket.emit("videoRoomUsers", { users: peers });
      socket.to(roomId).emit("videoUserJoined", {
        socketId: socket.id,
        user: socket.data.videoUser
      });
    });

    socket.on("videoOffer", ({ target, description } = {}) => {
      if (!target || !description) return;
      socket.to(target).emit("videoOffer", {
        from: socket.id,
        description
      });
    });

    socket.on("videoAnswer", ({ target, description } = {}) => {
      if (!target || !description) return;
      socket.to(target).emit("videoAnswer", {
        from: socket.id,
        description
      });
    });

    socket.on("iceCandidate", ({ target, candidate } = {}) => {
      if (!target || !candidate) return;
      socket.to(target).emit("iceCandidate", {
        from: socket.id,
        candidate
      });
    });

    socket.on("leaveVideoRoom", () => {
      leaveVideoRoom(socket);
    });

    socket.on("disconnect", () => {
      leaveVideoRoom(socket);
    });
  });
};

const getIO = () => io;

module.exports = { initSocket, getIO };
