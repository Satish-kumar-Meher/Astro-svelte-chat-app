
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);

app.use(cors({ origin: '*' }));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:4321", // Frontend URL
    methods: ["GET", "POST"]
  }
});

let rooms = {}; // Stores chat rooms and their users

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', ({ room, username }) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = [];
    rooms[room].push(username);

    io.to(room).emit('roomUsers', rooms[room]);
    console.log(`${username} joined ${room}`);
  });

  socket.on('sendMessage', ({ room, message, username }) => {
    io.to(room).emit('receiveMessage', { username, message });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(4000, () => console.log('Server running on port 4000'));


// import express from "express";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import cors from "cors";

// const app = express();
// const server = createServer(app);

// app.use(cors({ origin: '*' }));

// const io = new Server(server, {
//   cors: { origin: "http://localhost:4321", methods: ["GET", "POST"] }
// });

// let rooms = {}; // Stores room IDs and users

// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on('joinRoom', ({ room, roomId, username }) => {
//     if (!rooms[roomId]) {
//       rooms[roomId] = { name: room, users: [] };
//     }
    
//     socket.join(roomId);
//     rooms[roomId].users.push(username);
    
//     io.to(roomId).emit('roomUsers', rooms[roomId].users);
//     console.log(`${username} joined ${room} (ID: ${roomId})`);
//   });

//   socket.on('sendMessage', ({ room, message, username }) => {
//     io.to(room).emit('receiveMessage', { username, message });
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });

// server.listen(4000, () => console.log('Server running on port 4000'));
