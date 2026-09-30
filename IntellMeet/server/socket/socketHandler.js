const { Server } = require('socket.io');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173', // Safely allows connection requests from Vite
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  console.log('WebSocket Server configured cleanly.');

  io.on('connection', (socket) => {
    console.log(`User connected to live server: ${socket.id}`);

    // 1. Room Entry Gate Handler
    socket.on('join-room', ({ roomCode, userId, userName }) => {
      socket.join(roomCode);
      console.log(`[Socket] User ${userName} (${userId}) joined room: ${roomCode}`);
      
      // Notify other active room members that a new participant has arrived
      socket.to(roomCode).emit('user-connected', { userId, userName, socketId: socket.id });
    });

    // 2. WebRTC Signaling: Forwarding the Connection Offer
    socket.on('video-offer', ({ roomCode, offer }) => {
      console.log(`[Signaling] Forwarding video offer inside room: ${roomCode}`);
      socket.to(roomCode).emit('video-offer-received', { offer, socketId: socket.id });
    });

    // 3. WebRTC Signaling: Forwarding the Connection Answer
    socket.on('video-answer', ({ roomCode, answer }) => {
      console.log(`[Signaling] Forwarding video answer inside room: ${roomCode}`);
      socket.to(roomCode).emit('video-answer-received', { answer, socketId: socket.id });
    });

    // 4. WebRTC Signaling: Syncing Network Candidate Pathways
    socket.on('ice-candidate', ({ roomCode, candidate }) => {
      socket.to(roomCode).emit('ice-candidate-received', { candidate, socketId: socket.id });
    });

    // 💬 5. REAL-TIME CHAT: Forward incoming text messages to all other room participants
    socket.on('send-message', ({ roomCode, senderId, senderName, messageText }) => {
      console.log(`[Chat] Forwarding text stream from ${senderName} inside room: ${roomCode}`);
      
      socket.to(roomCode).emit('receive-message', {
        senderId,
        senderName,
        messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected from live server: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initSocket;
