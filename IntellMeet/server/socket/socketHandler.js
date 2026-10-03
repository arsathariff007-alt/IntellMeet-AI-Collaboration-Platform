const { Server } = require('socket.io');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'https://intell-meet-ai-collaboration-platfo.vercel.app',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  console.log('WebSocket Server configured successfully.');

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', ({ roomCode, userId, userName }) => {
      socket.join(roomCode);

      console.log(
        `[Socket] ${userName} (${userId}) joined room: ${roomCode}`
      );

      socket.to(roomCode).emit('user-connected', {
        userId,
        userName,
        socketId: socket.id,
      });
    });

    socket.on('video-offer', ({ roomCode, offer }) => {
      socket.to(roomCode).emit('video-offer-received', {
        offer,
        socketId: socket.id,
      });
    });

    socket.on('video-answer', ({ roomCode, answer }) => {
      socket.to(roomCode).emit('video-answer-received', {
        answer,
        socketId: socket.id,
      });
    });

    socket.on('ice-candidate', ({ roomCode, candidate }) => {
      socket.to(roomCode).emit('ice-candidate-received', {
        candidate,
        socketId: socket.id,
      });
    });

    socket.on('send-message', ({ roomCode, senderId, senderName, messageText }) => {
      console.log(
        `[Chat] ${senderName}: ${messageText}`
      );

      socket.to(roomCode).emit('receive-message', {
        senderId,
        senderName,
        messageText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initSocket;
