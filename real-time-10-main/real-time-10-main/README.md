# Real-Time Chat Application

A full-featured real-time chat application built with React (frontend) and Node.js + Socket.io (backend).

## Features

### ✅ Core Features
- **Real-time messaging** with Socket.io
- **Username-based login** (no password required)
- **Multiple chat rooms/channels**
- **Private messaging** between users
- **Online/offline user status**
- **Typing indicators**
- **Message reactions** (like, love, laugh)
- **File and image sharing**
- **Read receipts**
- **Sound notifications**
- **Browser notifications**
- **Unread message counts**
- **Message pagination** (load older messages)
- **Auto-reconnection** when disconnected
- **Mobile responsive design**

### 🎨 UI Features
- Modern design with Tailwind CSS
- Dark/light mode support
- Responsive layout
- Real-time connection status
- User avatars and presence indicators
- Emoji reactions on messages
- Typing animations

## Project Structure

```
/
├── README.md
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── src/
│   ├── components/
│   │   └── chat/
│   │       ├── ChatLayout.tsx
│   │       ├── LoginForm.tsx
│   │       ├── MessageList.tsx
│   │       ├── MessageInput.tsx
│   │       ├── UserList.tsx
│   │       ├── RoomList.tsx
│   │       ├── TypingIndicator.tsx
│   │       └── ConnectionStatus.tsx
│   ├── hooks/
│   │   └── useSocket.ts
│   ├── pages/
│   │   └── Index.tsx
│   └── main.tsx
└── server/ (you need to create this separately)
    ├── server.js
    ├── package.json
    └── .env
```

## Frontend Setup (Current Repository)

This repository contains the React frontend. It's ready to run and will connect to your backend server.

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set environment variables (optional):
Create a `.env` file in the root:
```env
VITE_SOCKET_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:8080`

## Backend Setup (You Need to Create This)

Create a separate directory for your backend server with the following structure:

### 1. Create server directory and initialize

```bash
mkdir chat-server
cd chat-server
npm init -y
```

### 2. Install backend dependencies

```bash
npm install express socket.io cors dotenv uuid
npm install -D nodemon
```

### 3. Create server.js

```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage (use a database in production)
const users = new Map();
const rooms = new Map();
const messages = new Map();

// Initialize default room
rooms.set('general', {
  id: 'general',
  name: 'General',
  type: 'public',
  participants: [],
  messages: []
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication
  socket.on('authenticate', (username) => {
    const user = {
      id: socket.id,
      username,
      isOnline: true,
      lastSeen: new Date()
    };
    
    users.set(socket.id, user);
    socket.username = username;
    socket.join('general');
    
    // Add user to general room
    const generalRoom = rooms.get('general');
    if (!generalRoom.participants.includes(socket.id)) {
      generalRoom.participants.push(socket.id);
    }
    
    // Broadcast user joined
    socket.broadcast.emit('userJoined', user);
    
    // Send current users list
    io.emit('usersList', Array.from(users.values()));
    
    // Send rooms list
    socket.emit('roomsList', Array.from(rooms.values()));
    
    // Send message history for general room
    socket.emit('messageHistory', generalRoom.messages);
  });

  // Handle messages
  socket.on('message', (data) => {
    const user = users.get(socket.id);
    if (!user) return;
    
    const message = {
      id: uuidv4(),
      content: data.content,
      sender: socket.id,
      senderName: user.username,
      timestamp: new Date(),
      type: data.type || 'text',
      roomId: data.roomId || 'general',
      reactions: {},
      readBy: []
    };
    
    const room = rooms.get(message.roomId);
    if (room) {
      room.messages.push(message);
      io.to(message.roomId).emit('message', message);
    }
  });

  // Handle private messages
  socket.on('privateMessage', (data) => {
    const user = users.get(socket.id);
    const recipient = users.get(data.recipientId);
    
    if (!user || !recipient) return;
    
    const message = {
      id: uuidv4(),
      content: data.content,
      sender: socket.id,
      senderName: user.username,
      timestamp: new Date(),
      type: 'text',
      isPrivate: true,
      recipient: data.recipientId
    };
    
    // Send to sender and recipient
    socket.emit('message', message);
    socket.to(data.recipientId).emit('message', message);
  });

  // Handle room operations
  socket.on('createRoom', (data) => {
    const roomId = uuidv4();
    const room = {
      id: roomId,
      name: data.name,
      type: data.type || 'public',
      participants: [socket.id],
      messages: []
    };
    
    rooms.set(roomId, room);
    socket.join(roomId);
    
    io.emit('roomsList', Array.from(rooms.values()));
  });

  socket.on('joinRoom', (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      socket.join(roomId);
      if (!room.participants.includes(socket.id)) {
        room.participants.push(socket.id);
      }
      
      socket.emit('messageHistory', room.messages);
      io.emit('roomsList', Array.from(rooms.values()));
    }
  });

  // Handle typing indicators
  socket.on('startTyping', (roomId) => {
    socket.to(roomId).emit('userTyping', { userId: socket.id, isTyping: true });
  });

  socket.on('stopTyping', (roomId) => {
    socket.to(roomId).emit('userTyping', { userId: socket.id, isTyping: false });
  });

  // Handle reactions
  socket.on('addReaction', (data) => {
    const { messageId, reaction } = data;
    const user = users.get(socket.id);
    
    if (!user) return;
    
    // Find message in all rooms
    for (const room of rooms.values()) {
      const message = room.messages.find(m => m.id === messageId);
      if (message) {
        if (!message.reactions[reaction]) {
          message.reactions[reaction] = [];
        }
        
        if (!message.reactions[reaction].includes(socket.id)) {
          message.reactions[reaction].push(socket.id);
        }
        
        io.to(message.roomId).emit('messageReaction', {
          messageId,
          reaction,
          userId: socket.id
        });
        break;
      }
    }
  });

  // Handle read receipts
  socket.on('markAsRead', (messageId) => {
    for (const room of rooms.values()) {
      const message = room.messages.find(m => m.id === messageId);
      if (message) {
        if (!message.readBy.includes(socket.id)) {
          message.readBy.push(socket.id);
        }
        
        io.to(message.roomId).emit('messageRead', {
          messageId,
          userId: socket.id
        });
        break;
      }
    }
  });

  // Handle message pagination
  socket.on('loadMessages', (data) => {
    const room = rooms.get(data.roomId);
    if (room) {
      const beforeDate = new Date(data.before);
      const messages = room.messages
        .filter(m => m.timestamp < beforeDate)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, data.limit || 20)
        .reverse();
      
      socket.emit('messageHistory', messages);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const user = users.get(socket.id);
    if (user) {
      user.isOnline = false;
      user.lastSeen = new Date();
      
      // Remove from rooms
      for (const room of rooms.values()) {
        room.participants = room.participants.filter(id => id !== socket.id);
      }
      
      // Broadcast user left
      socket.broadcast.emit('userLeft', socket.id);
      
      // Update users list
      io.emit('usersList', Array.from(users.values()));
      
      // Remove user after delay (in case of reconnection)
      setTimeout(() => {
        users.delete(socket.id);
        io.emit('usersList', Array.from(users.values()));
      }, 30000);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 4. Create package.json scripts

Add to your server's package.json:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 5. Create .env file in server directory

```env
PORT=5000
CLIENT_URL=http://localhost:8080
```

### 6. Start the backend server

```bash
npm run dev
```

## Running the Full Application

1. **Start the backend server** (port 5000):
```bash
cd chat-server
npm run dev
```

2. **Start the frontend** (port 8080):
```bash
npm run dev
```

3. **Open your browser** and go to `http://localhost:8080`

## Deployment

### Backend Deployment (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your backend repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables:
   - `CLIENT_URL`: Your frontend URL (e.g., `https://yourapp.netlify.app`)

### Frontend Deployment (Vercel/Netlify)

1. **For Vercel:**
   - Connect your repository
   - Set environment variable: `VITE_SOCKET_URL` to your backend URL

2. **For Netlify:**
   - Connect your repository
   - Set environment variable: `VITE_SOCKET_URL` to your backend URL

## Development Notes

- The frontend is built with Vite + React + TypeScript
- Uses Tailwind CSS for styling
- Socket.io client for real-time communication
- Includes error handling and reconnection logic
- Mobile-responsive design
- Accessibility features included

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License
